import components from 'core/js/components';
import MediaView from './mediaView';
import ComponentModel from 'core/js/models/componentModel';

export default components.register('assessmentResults-graphical', {
  // create a new class in the inheritance chain so it can be extended per component type if necessary later
  model: ComponentModel.extend({}),
  view: MediaView
});

/* 
define(function(require) {

  var ComponentView = require('coreViews/componentView');
  var Adapt = require('coreJS/adapt');
  //var Chart = require('components/adapt-assessmentResults-graphical/js/chart');

    var AssessmentResultsGraphical = ComponentView.extend({

      events: {
          'inview': 'onInview'
      },

      preRender: function () {
          this.setupEventListeners();
          this.setupModelResetEvent();
          this.checkIfVisible();
      },

      checkIfVisible: function() {

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
      },
      
      isComplete: function() {
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
      },

      setupModelResetEvent: function() {
          if (this.model.onAssessmentsReset) return;
          this.model.onAssessmentsReset = function(state) {
              this.reset('hard', true);
          };
          this.model.listenTo(Adapt, 'assessments:reset', this.model.onAssessmentsReset);
      },

      postRender: function() {
          this.setReadyStatus();
      },
      setupEventListeners: function() {
          this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);
          this.listenToOnce(Adapt, 'remove', this.onRemove);
      },

      removeEventListeners: function() {;
          this.stopListening(Adapt, 'assessment:complete', this.onAssessmentComplete);
          this.stopListening(Adapt, 'remove', this.onRemove);
      },

      onAssessmentComplete: function(state) {
          this.model.set("_state", state);

        // ##################

        var assessmentArticleModels = Adapt.assessment.get();
        if (assessmentArticleModels.length === 0) return;

        for (var i = 0, l = assessmentArticleModels.length; i < l; i++) {
            var articleModel = assessmentArticleModels[i];
            var assessmentState = articleModel.getState();
            isComplete = assessmentState.isComplete;
        }

//        const ctx = document.getElementById('myChart'+this.model.get('_id')).getContext('2d');
        
        const ctx = document.getElementById('myChart').getContext('2d');

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

          // ####################

          this.setFeedback();

          //show feedback component
          this.render();
          if(!this.model.get('_isVisible')) this.model.set('_isVisible', true);
          
      },

      onInview: function(event, visible, visiblePartX, visiblePartY) {
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
      },

      setFeedback: function() {

          var completionBody = this.model.get("_completionBody");
          var feedbackBand = this.getFeedbackBand();

          var state = this.model.get("_state");
          state.feedbackBand = feedbackBand;
          state.feedback = feedbackBand.feedback;

          completionBody = this.stringReplace(completionBody, state);

          this.model.set("body", completionBody);

      },

      getFeedbackBand: function() {
          var state = this.model.get("_state");

          var bands = this.model.get("_bands");
          var scoreAsPercent = state.scoreAsPercent;
          
          for (var i = (bands.length - 1); i >= 0; i--) {
              if (scoreAsPercent >= bands[i]._score) {
                  return bands[i];
              }
          }

          return "";
      },

      stringReplace: function(string, context) {
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
      },

      onRemove: function() {
          this.removeEventListeners();
      }
      
  });
  
  Adapt.register("assessmentResults-graphical", AssessmentResultsGraphical);
  
});

*/