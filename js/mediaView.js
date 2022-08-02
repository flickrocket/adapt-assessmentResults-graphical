import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';

import * as echarts from '../libraries/echarts';

class AssessmentResultsGraphical extends ComponentView {

        events() {
           // 'inview': 'onInview'
        }
  
        preRender() {
            this.setupEventListeners();
            this.setupModelResetEvent();
            this.checkIfVisible();
        }
  
        checkIfVisible() {
  
            var wasVisible = this.model.get("_isVisible");
            var isVisibleBeforeCompletion = this.model.get("_isVisibleBeforeCompletion") || false;
  
            var isVisible = wasVisible && isVisibleBeforeCompletion;
  
            var assessmentArticleModels = Adapt.assessment.get();
            if (assessmentArticleModels.length === 0) return;
  
            var isComplete = this.isComplete();
  
            if (!isVisibleBeforeCompletion) isVisible = isVisible || isComplete;
  
            this.model.set('_isVisible', isVisible);
  
            // if assessment(s) already complete then render
            if (isComplete) this.onAssessmentComplete(Adapt.assessment.getState());
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
  
            if (!isComplete) {
                this.model.reset("hard", true);
            }
            
            return isComplete;
        }
  
        setupModelResetEvent() {
            if (this.model.onAssessmentsReset) return;
            this.model.onAssessmentsReset = function(state) {
                this.reset('hard', true);
            };
            this.model.listenTo(Adapt, 'assessments:reset', this.model.onAssessmentsReset);
        }
  
        postRender() {
            this.setReadyStatus();
        }

        setupEventListeners() {
            this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);
            this.listenToOnce(Adapt, 'remove', this.onRemove);
        }
  
        removeEventListeners() {;
            this.stopListening(Adapt, 'assessment:complete', this.onAssessmentComplete);
            this.stopListening(Adapt, 'remove', this.onRemove);
        }
  
        onAssessmentComplete(state) {
            this.model.set("_state", state);
  
          //this.setFeedback(); // Don't show summary information
          this.render();

        // ##################

          var assessmentArticleModels = Adapt.assessment.get();
          if (assessmentArticleModels.length === 0) return;

          let assesmentNames = [];
          let assessmentScores = [];
  
          for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
              var articleModel = assessmentArticleModels[i];
              var assessmentState = articleModel.getState();
              
              // isComplete = assessmentState.isComplete;

              assesmentNames.push(assessmentState.id);
              assessmentScores.push(assessmentState.score);
          }

            // Initialize the echarts instance based on the prepared dom
            var myChart = echarts.init(document.getElementById('resultGraphics'));

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
                    //data: ['Shirts', 'Cardigans', 'Chiffons', 'Pants', 'Heels', 'Socks']
                    data: assesmentNames
                },
                yAxis: {},
                    series: [
                    {
                        name: 'Results',
                        type: 'bar',
                        //data: [5, 20, 36, 10, 10, 20]
                        data: assessmentScores
                    }
                ]
            };

            // Display the chart using the configuration items and data just specified.
            myChart.setOption(option);

            var printButton = document.getElementById('chartPrintButton');
            printButton.style.display = "block";

            // ####################
  
            if(!this.model.get('_isVisible')) this.model.set('_isVisible', true);
        }

        onInview(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }
                
                if (this._isVisibleTop || this._isVisibleBottom) {
                    this.setCompletionStatus();
                    this.$el.off("inview");
                }
            }
        }
  
        setFeedback() {
  
            var completionBody = this.model.get("_completionBody");
            var feedbackBand = this.getFeedbackBand();
  
            var state = this.model.get("_state");
            state.feedbackBand = feedbackBand;
            state.feedback = feedbackBand.feedback;
  
            completionBody = this.stringReplace(completionBody, state);
  
            this.model.set("body", completionBody);
  
        }
  
        getFeedbackBand() {
            var state = this.model.get("_state");
  
            var bands = this.model.get("_bands");
            var scoreAsPercent = state.scoreAsPercent;
            
            for (var i = (bands.length - 1); i >= 0; i--) {
                if (scoreAsPercent >= bands[i]._score) {
                    return bands[i];
                }
            }
  
            return "";
        }
  
        stringReplace(string, context) {
            //use handlebars style escaping for string replacement
            //only supports unescaped {{{ attributeName }}} and html escaped {{ attributeName }}
            //will string replace recursively until no changes have occured
  
            var changed = true;
            while (changed) {
                changed = false;
                for (var k in context) {
                    var contextValue = context[k];
  
                    switch (typeof contextValue) {
                    case "object":
                        continue;
                    case "number":
                        contextValue = Math.floor(contextValue);
                        break;
                    }
  
                    var regExNoEscaping = new RegExp("((\\{\\{\\{){1}[\\ ]*"+k+"[\\ ]*(\\}\\}\\}){1})","g");
                    var regExEscaped = new RegExp("((\\{\\{){1}[\\ ]*"+k+"[\\ ]*(\\}\\}){1})","g");
  
                    var preString = string;
  
                    string = string.replace(regExNoEscaping, contextValue);
                    var escapedText = $("<p>").text(contextValue).html();
                    string = string.replace(regExEscaped, escapedText);
  
                    if (string != preString) changed = true;
  
                }
            }
  
            return string;
        }
  
        onRemove() {
            this.removeEventListeners();
        }

    }
    //});

    export default AssessmentResultsGraphical;
  