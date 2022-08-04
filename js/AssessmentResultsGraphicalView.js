import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';

export default class AssessmentResultsGraphical extends ComponentView {

    events() {
        return {
            'inview': 'onInview'
        };
    }

    preRender() {
        this.model.setLocking('_isVisible', false);
    
        this.listenTo(Adapt.parentView, 'preRemove', () => {
            this.model.unsetLocking('_isVisible');
        });
    
        this.listenTo(this.model, {
            'change:_feedbackBand': this.addClassesToArticle,
            'change:body': this.render
        });
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
    }
  
    setupModelResetEvent() {
        if (this.model.onAssessmentsReset) return;
        this.model.onAssessmentsReset = function(state) {
            this.reset('hard', true);
        };
        this.model.listenTo(Adapt, 'assessments:reset', this.model.onAssessmentsReset);
    }

    postRender() {
        this.model.checkIfAssessmentComplete();
        this.setReadyStatus();
        this.setupInviewCompletion('.component__inner', this.model.checkCompletion.bind(this.model));
        }

    setupEventListeners() {
        this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);
        this.listenToOnce(Adapt, 'remove', this.onRemove);
    }

    removeEventListeners() {;
        this.stopListening(Adapt, 'assessment:complete', this.onAssessmentComplete);
        this.stopListening(Adapt, 'remove', this.onRemove);
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

    /**
    * If there are classes specified for the feedback band, apply them to the containing article
    * This allows for custom styling based on the band the user's score falls into
    */
    addClassesToArticle(model, value) {
        if (!value?._classes) return;

        this.$el.parents('.article').addClass(value._classes);
    }

}
  