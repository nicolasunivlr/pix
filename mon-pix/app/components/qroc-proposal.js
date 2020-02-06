import { computed } from '@ember/object';
import Component from '@ember/component';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default Component.extend({

  classNames: ['qroc-proposal'],

  format: null,
  proposals: null,
  answerValue: null,
  answerChanged: null, // action
  postMessageHandler:null,

  _blocks: computed('proposals', function() {
    return proposalsAsBlocks(this.proposals);
  }),

  userAnswer : computed('answerValue', function() {
    const answer = this.answerValue || '';
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }),

  _setAnswerValue(event) {
    this.set('answerValue',event.data) ;
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.set('userAnswer', '');
  },

  didInsertElement: function() {
    this.postMessageHandler = this._setAnswerValue.bind(this);
    window.addEventListener('message', this.postMessageHandler);

    this.$('input').keydown(() => {
      this.answerChanged();
    });
  },

  didDestroyElement: function() {
    window.removeEventListener('message',this.postMessageHandler);
  },

  willRender: function() {
    this.notifyPropertyChange('proposals');
  }
});
