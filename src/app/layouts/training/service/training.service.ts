import { Injectable } from '@angular/core';
import { TRAININGS } from '../../../data/training';


@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  
getTrainingsForExercise(userId: string, exerciseId: string) {
  console.log(TRAININGS);
  
  // hier kommt deine Logik rein
  return TRAININGS.filter(t =>
    t.userId === userId &&
    t.exerciseId === exerciseId)
}

}
