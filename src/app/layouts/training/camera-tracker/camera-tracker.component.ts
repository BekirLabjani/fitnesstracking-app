import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PremiumService } from '../../../shared/premium/premium.service';
import { TrainingService } from '../service/training.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { PoseRepCounter } from '../../../shared/pose-tracking/pose-rep-counter';

type Status = 'idle' | 'starting' | 'tracking' | 'error';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

@Component({
  selector: 'app-camera-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './camera-tracker.component.html',
  styleUrl: './camera-tracker.component.scss',
})
export class CameraTrackerComponent implements OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  premium = inject(PremiumService);
  private trainingService = inject(TrainingService);
  private toast = inject(ToastService);

  status: Status = 'idle';
  errorMessage = '';
  reps = 0;
  saving = false;

  private counter = new PoseRepCounter('pushups');
  private stream?: MediaStream;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private landmarker?: any;
  private rafId?: number;

  async start() {
    this.status = 'starting';
    this.errorMessage = '';
    this.counter.reset();
    this.reps = 0;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();

      if (!this.landmarker) {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
      }

      this.status = 'tracking';
      this.loop();
    } catch {
      this.status = 'error';
      this.errorMessage = 'Kamera-Zugriff fehlgeschlagen. Bitte Berechtigung erlauben und erneut versuchen.';
      this.cleanupStream();
    }
  }

  stop() {
    this.status = 'idle';
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.cleanupStream();
  }

  async saveAsTraining() {
    if (this.reps === 0) {
      this.toast.error('Keine Wiederholungen erkannt');
      return;
    }
    this.saving = true;
    try {
      await this.trainingService.addStrengthTraining('pushups', 0, this.reps, 1, 'Per Kamera-Tracking erkannt');
      this.toast.success(`${this.reps} Liegestütze gespeichert`);
      this.reps = 0;
      this.counter.reset();
    } catch {
      this.toast.error('Speichern fehlgeschlagen');
    } finally {
      this.saving = false;
    }
  }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.cleanupStream();
    this.landmarker?.close?.();
  }

  private loop = () => {
    if (this.status !== 'tracking' || !this.landmarker) return;
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2 && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const result = this.landmarker.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const landmarks = result?.landmarks?.[0];
      if (landmarks) {
        this.drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
        this.counter.update(landmarks);
        this.reps = this.counter.reps;
      }
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private drawSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    width: number,
    height: number
  ) {
    ctx.fillStyle = 'rgba(59,130,246,0.9)';
    for (const point of landmarks) {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private cleanupStream() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
  }
}
