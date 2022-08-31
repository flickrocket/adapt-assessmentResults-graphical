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

    let assessment = Adapt.assessment;
    if (assessment) {
      var assessmentArticleModels = assessment.get();
      if (assessmentArticleModels.length === 0) return;

      for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
          var articleModel = assessmentArticleModels[i];
          var assessmentState = articleModel.getState();
          isInProgress = assessmentState.attemptInProgress;
          if (!isInProgress) break;
      }
    }

    return isInProgress;
  }

  isComplete() {
    var isComplete = false;

    let assessment = Adapt.assessment;
    if (assessment) {
      var assessmentArticleModels = assessment.get();
      if (assessmentArticleModels.length === 0) return;

      for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
          var articleModel = assessmentArticleModels[i];
          var assessmentState = articleModel.getState();
          isComplete = assessmentState.isComplete;
          if (!isComplete) break;
      }
    }

    return isComplete;
  }

  onAssessmentComplete() {

    if (!this.isComplete()) return;

    var assessment = Adapt.assessment;
    if (!assessment) return;

    var assessmentArticleModels = assessment.get();
    if (assessmentArticleModels.length === 0) return;

    let assesmentNames = [];
    let assessmentScores = [];

    for (var i = 0; i < assessmentArticleModels.length;  i++) {
        var articleModel = assessmentArticleModels[i];
        var assessmentState = articleModel.getState();
        assesmentNames.push(assessmentState.id);
        assessmentScores.push(assessmentState.score);
    }

    // Initialize the echarts instance based on the prepared dom
    var chartElement = document.getElementById('resultGraphics');
    if (!chartElement) return;

    var myChart = echarts.init(chartElement);
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

    // Show Feedback
    this.setFeedbackBand();

    this.checkRetryEnabled();

    this.setFeedbackText();

    this.toggleVisibility(true);
  }

  // setFeedback() {

  //   var completionBody = this.model.get("_completionBody");
  //   var feedbackBand = this.getFeedbackBand();

  //   var state = this.model.get("_state");
  //   state.feedbackBand = feedbackBand;
  //   state.feedback = feedbackBand.feedback;

  //   completionBody = this.stringReplace(completionBody, state);

  //   this.model.set("body", completionBody);
  // }

  // getFeedbackBand() {
  //   var state = this.model.get("_state");

  //   var bands = this.model.get("_bands");
  //   var scoreAsPercent = state.scoreAsPercent;
    
  //   for (var i = (bands.length - 1); i >= 0; i--) {
  //       if (scoreAsPercent >= bands[i]._score) {
  //           return bands[i];
  //       }
  //   }

  //   return "";
  // }

  // stringReplace(string, context) {
  //   //use handlebars style escaping for string replacement
  //   //only supports unescaped {{{ attributeName }}} and html escaped {{ attributeName }}
  //   //will string replace recursively until no changes have occured

  //   var changed = true;
  //   while (changed) {
  //       changed = false;
  //       for (var k in context) {
  //           var contextValue = context[k];

  //           switch (typeof contextValue) {
  //           case "object":
  //               continue;
  //           case "number":
  //               contextValue = Math.floor(contextValue);
  //               break;
  //           }

  //           var regExNoEscaping = new RegExp("((\\{\\{\\{){1}[\\ ]*"+k+"[\\ ]*(\\}\\}\\}){1})","g");
  //           var regExEscaped = new RegExp("((\\{\\{){1}[\\ ]*"+k+"[\\ ]*(\\}\\}){1})","g");

  //           var preString = string;

  //           string = string.replace(regExNoEscaping, contextValue);
  //           var escapedText = $("<p>").text(contextValue).html();
  //           string = string.replace(regExEscaped, escapedText);

  //           if (string != preString) changed = true;

  //       }
  //   }

  //   return string;
  // }

  //TODO
  setFeedbackBand() {
    
    let percentageBased = false; // Set to true and handle as such if at elast one assessment is percentage based

    // Determine total score
    var assessmentArticleModels = Adapt.assessment.get();
    
    let totalPercentScore = 0;
    let totalNonPercentScore = 0;
    let totalMaxScore = 0;

    for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
        var articleModel = assessmentArticleModels[i];
        var assessmentState = articleModel.getState();
        if (assessmentState.isPercentageBased) {
          percentageBased = true;
        }
        totalNonPercentScore += assessmentState.score;
        totalPercentScore += assessmentState.scoreAsPercent;
        totalMaxScore += assessmentState.maxScore;
    }

    let finalScore = percentageBased ? totalPercentScore : totalNonPercentScore;
    let finalMaxScore = percentageBased ? 100 : totalMaxScore;

    this.set({
      score: finalScore,
      maxScore: finalMaxScore
    });

    const bands = _.sortBy(this.get('_bands'), '_score');

    for (let i = (bands.length - 1); i >= 0; i--) {
      const isScoreInBandRange = (finalScore >= bands[i]._score);
      if (!isScoreInBandRange) continue;

      this.set('_feedbackBand', bands[i]);
      break;
    }
  }

  // TODO
  checkRetryEnabled() {
    // const assessmentModel = Adapt.assessment.get(state.id);
    // if (!assessmentModel.canResetInPage()) return false;

    // const feedbackBand = this.get('_feedbackBand');
    // const isRetryEnabled = (feedbackBand && feedbackBand._allowRetry) !== false;
    // const isAttemptsLeft = (state.attemptsLeft > 0 || state.attemptsLeft === 'infinite');
    // const showRetry = isRetryEnabled && isAttemptsLeft && (!state.isPass || state.allowResetIfPassed);

    // this.set({
    //   _isRetryEnabled: showRetry,
    //   retryFeedback: showRetry ? this.get('_retry').feedback : ''
    // });
  }

  //TODO
  setFeedbackText() {
    const feedbackBand = this.get('_feedbackBand');

    // ensure any handlebars expressions in the .feedback are handled...
    const feedback = feedbackBand ? Handlebars.compile(feedbackBand.feedback)(this.toJSON()) : '';

    this.set({
      feedback,
      body: this.get('_completionBody')
    });
  }

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
