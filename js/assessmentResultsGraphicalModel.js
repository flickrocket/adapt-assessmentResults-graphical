import Adapt from 'core/js/adapt';
import ComponentModel from 'core/js/models/componentModel';

import * as echarts from '../libraries/echarts';

export default class AssessmentResultsGraphicalModel extends ComponentModel {

  init(...args) {
    // save the original body text so we can restore it when the assessment is reset
    this.set('originalBody', this.get('body'));

    this.listenTo(Adapt, {
      'assessments:complete': this.onAssessmentComplete,
      'assessments:reset': this.onAssessmentReset
    });

    super.init(...args);
  }


  /**
   * Checks to see if the assessment was completed in a previous session or not
   */
  checkIfAssessmentComplete() {
    if (!this.isComplete()) return;

    this.onAssessmentComplete();

    this.setVisibility();
  }

  isInProgress() {
    var isInProgress = false;

    var assessmentArticleModels = Adapt.assessment.get();
    if (assessmentArticleModels.length === 0) return;

    for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
        var articleModel = assessmentArticleModels[i];
        var assessmentState = articleModel.getState();
        isInProgress = assessmentState.attemptInProgress;
        if (!isInProgress) break;
    }

    return isInProgress;
  }

  isComplete() {
    var isComplete = false;

    var assessmentArticleModels = Adapt.assessment.get();
    if (assessmentArticleModels.length === 0) return;

    for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
        var articleModel = assessmentArticleModels[i];
        var assessmentState = articleModel.getState();
        isComplete = assessmentState.isComplete;
        if (!isComplete) break;
    }

    return isComplete;
  }

  onAssessmentComplete() {

    if (!this.isComplete) return;

    var assessmentArticleModels = Adapt.assessment.get();
    if (assessmentArticleModels.length === 0) return;

    let assesmentNames = [];
    let assessmentScores = [];

    for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
        var articleModel = assessmentArticleModels[i];
        var assessmentState = articleModel.getState();
        assesmentNames.push(assessmentState.id);
        assessmentScores.push(assessmentState.score);
    }

    // Initialize the echarts instance based on the prepared dom
    var myChart = echarts.init(document.getElementById('resultGraphics'));
    if (!myChart) return;

    window.myChart = myChart;

    // Specify the configuration items and data for the chart
    var option = {
        title: {
            text: 'Your results'
        },
        tooltip: {},
        legend: {
            data: ['Results']
        },
        xAxis: {
            data: assesmentNames
        },
        yAxis: {},
            series: [
            {
                name: 'Results',
                type: 'bar',
                data: assessmentScores
            }
        ]
    };

    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);

    var printButton = document.getElementById('chartPrintButton');
    printButton.style.display = "block";
  }

  // setFeedbackBand(state) {
  //   const scoreProp = state.isPercentageBased ? 'scoreAsPercent' : 'score';
  //   const bands = _.sortBy(this.get('_bands'), '_score');

  //   for (let i = (bands.length - 1); i >= 0; i--) {
  //     const isScoreInBandRange = (state[scoreProp] >= bands[i]._score);
  //     if (!isScoreInBandRange) continue;

  //     this.set('_feedbackBand', bands[i]);
  //     break;
  //   }
  // }

  // checkRetryEnabled(state) {
  //   const assessmentModel = Adapt.assessment.get(state.id);
  //   if (!assessmentModel.canResetInPage()) return false;

  //   const feedbackBand = this.get('_feedbackBand');
  //   const isRetryEnabled = (feedbackBand && feedbackBand._allowRetry) !== false;
  //   const isAttemptsLeft = (state.attemptsLeft > 0 || state.attemptsLeft === 'infinite');
  //   const showRetry = isRetryEnabled && isAttemptsLeft && (!state.isPass || state.allowResetIfPassed);

  //   this.set({
  //     _isRetryEnabled: showRetry,
  //     retryFeedback: showRetry ? this.get('_retry').feedback : ''
  //   });
  // }

  // setFeedbackText() {
  //   const feedbackBand = this.get('_feedbackBand');

  //   // ensure any handlebars expressions in the .feedback are handled...
  //   const feedback = feedbackBand ? Handlebars.compile(feedbackBand.feedback)(this.toJSON()) : '';

  //   this.set({
  //     feedback,
  //     body: this.get('_completionBody')
  //   });
  // }

  setVisibility() {
    if (!Adapt.assessment) return;

    const isAttemptInProgress = this.isInProgress(); // state.attemptInProgress;
    const isComplete = !isAttemptInProgress && this.isComplete(); //state.isComplete;
    const isVisibleBeforeCompletion = this.get('_isVisibleBeforeCompletion') || false;
    const isVisible = isVisibleBeforeCompletion || isComplete;

    this.toggleVisibility(isVisible);
  }

  toggleVisibility(isVisible) {
    if (isVisible === undefined) {
      isVisible = !this.get('_isVisible');
    }

    this.set('_isVisible', isVisible, { pluginName: 'assessmentResults' });
  }

  checkCompletion() {
    if (this.get('_setCompletionOn') === 'pass' && !this.get('isPass')) {
      return;
    }

    this.setCompletionStatus();
  }

  /**
   * Handles resetting the component whenever its corresponding assessment is reset
   * The component can either inherit the assessment's reset type or define its own
   */
  onAssessmentReset(state) {
    if (this.get('_assessmentId') === undefined ||
        this.get('_assessmentId') !== state.id) return;

    let resetType = this.get('_resetType');
    if (!resetType || resetType === 'inherit') {
      // backwards compatibility - state.resetType was only added in assessment v2.3.0
      resetType = state.resetType || 'hard';
    }
    this.reset(resetType, true);
  }

  reset(...args) {
    this.set({
      body: this.get('originalBody'),
      state: null,
      feedback: '',
      _feedbackBand: null,
      retryFeedback: '',
      _isRetryEnabled: false
    });

    super.reset(...args);
  }
}
