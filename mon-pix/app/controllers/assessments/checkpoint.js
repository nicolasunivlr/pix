import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.get('finalCheckpoint') ? 'Voir mes résultats' : 'Continuer mon parcours';
  }),

  totalPixForFiveNewAnswer: computed('lastAnswers', function() {
    const sumOfPixEarned = this.get('lastAnswers').reduce((sum, answer) => sum + (answer.pixEarned || 0), 0);
    return (sumOfPixEarned > 0 && sumOfPixEarned < 1) ? 1 : Math.floor(sumOfPixEarned);
  }),

  actions: {
    openComparison(assessment_id, answer_id, index) {
      return this.transitionToRoute('assessments.comparison', assessment_id, answer_id, index);
    }
  }

});
