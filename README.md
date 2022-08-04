# adapt-assessmentResults-graphical

**Assessment Results Graphical** is a *presentation component* bundled with the [Adapt framework](https://github.com/adaptlearning/adapt_framework).

It is used to display a graphic and text for all assessments in the package. It can be used only in conjunction with [adapt-contrib-assessment](https://github.com/adaptlearning/adapt-contrib-assessment). Feedback and the opportunity to reattempt the assessment may be coordinated with range of scores, and most importantly, with the `_scoreToPass` variable from **Assessment**.

[Visit the **Assessment Results** wiki](https://github.com/adaptlearning/adapt-contrib-assessmentResults/wiki) for more information about its functionality and for explanations of key properties.

## Installation

* If **Assessment Results Graphical** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
`adapt install adapt-assessmentResults-graphical`

    Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:
    `"adapt-assessmentResults-graphical": "*"`
    Then running the command:
    `adapt install`
    (This second method will reinstall all plug-ins listed in *adapt.json*.)

* If **Assessment Results Graphical** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).
<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

**Important note: do not put the Assessment Results Graphical component in the same article as the assessment itself**.

The attributes listed below are used in *components.json* to configure **Assessment Results Graphical**, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-assessmentResults-graphical/blob/master/example.json). Visit the [**Assessment Results Graphical** wiki](https://github.com/adaptlearning/adapt-assessmentResults.graphical/wiki) for more information about how they appear in the [authoring tool](https://github.com/adaptlearning/adapt_authoring/wiki).

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**\_component** (string): This value must be: `assessmentResultsGraphical`. (One word with uppercase "R" and "G".)

**\_classes** (string): CSS class name(s) to be applied to **Assessment Results Graphical**’ containing `div`. The class(es) must be predefined in one of the Less files. Separate multiple classes with a space.

**\_layout** (string): This defines the horizontal position of the component in the block. Values can be `full`, `left` or `right`.

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**\_isVisibleBeforeCompletion** (boolean): Determines whether this component will be visible as the learner enters the assessment article or if it will be displayed only after the learner completes all question components. Acceptable values are `true` or `false`. The default is `false`.

**\_setCompletionOn** (string): Can be set to `"inview"` or `"pass"`. A a setting of `"inview"` will cause the component to be marked as completed when it has been viewed regardless of whether or not the assessment was passed, whereas a setting of `"pass"` will cause the component to be set to completed when this component has been viewed **and** the assessment has been passed. This setting can be very useful if you have further content on the page that's hidden by trickle which you don't want the user to be able to access until they have passed the assessment. Default is `"inview"`.

**\_resetType** (string): Valid values are: `"hard"`, `"soft"` and `"inherit"`. Controls whether this component does a 'soft' or 'hard' reset when the corresponding assessment is reset. A 'soft' reset will reset everything except component completion; a 'hard' reset will reset component completion as well, requiring the user to complete this component again. If you want this component to have the same reset behaviour as the corresponding assessment you can leave this property out - or set it to 'inherit'.

**\_retry** (object): Contains values for **button**, **feedback** and **\_routeToAssessment**.

>**button** (string): Text that appears on the retry button.

>**feedback** (string): This text is displayed only when both **\_allowRetry** is `true` and more attempts remain ([configured in adapt-contrib-assessment](https://github.com/adaptlearning/adapt-assessment-graphical#attributes)). It may make use of the following variables: `{{attemptsSpent}}`, `{{attempts}}`, `{{attemptsLeft}}`, `{{score}}`, `{{scoreAsPercent}}` and `{{maxScore}}`. These values are populated with data supplied by [adapt-contrib-assessment](https://github.com/adaptlearning/adapt-assessment-graphical#attributes). `{{{feedback}}}`, representing the feedback assigned to the appropriate band within this component, is also allowed.

**\_completionBody** (string): This text overwrites the standard **body** attribute upon completion of the assessment. It may make use of the following variables: `{{attemptsSpent}}`, `{{attempts}}`, `{{attemptsLeft}}`, `{{score}}`, `{{scoreAsPercent}}` and `{{maxScore}}`. The variable `{{{feedback}}}`, representing the feedback assigned to the appropriate band, is also allowed.

**\_bands** (object array): Multiple items may be created. Each item represents the feedback and opportunity to retry for the appropriate range of scores. **\_bands** contains values for **\_score**, **feedback**, **\_allowRetry** and **\_classes**.

>**\_score** (number):  This numeric value represents the raw score or percentile (as determined by the configuration of [adapt-contrib-assessment](https://github.com/adaptlearning/adapt-contrib-assessment)) that indicates the low end or start of the range. The range continues to the next highest **\_score** of another band.

>**feedback** (string): This text will be displayed to the learner when the learner's score falls within this band's range. It replaces the `{{{feedback}}}` variable when the variable is used within **\_completionBody**.

>**\_allowRetry** (boolean): Determines whether the learner will be allowed to reattempt the assessment. If the value is `false`, the learner will not be allowed to retry the assessment regardless of any remaining attempts.

>**\_classes** (string): Classes that will be applied to the containing article if the user's score falls into this band. Allows for custom styling based on the feedback band.

<div float align=right><a href="#top">Back to Top</a></div>

[Visit the **Usage and Tips** page of the wiki](https://github.com/adaptlearning/adapt-contrib-assessmentResults/wiki/Usage-and-Tips) for more information about configuring **Assessment Results**.

For a guide on the difference between using two curly braces and three curly braces when working with the variables that are available in this component, see [the HTML escaping section of the the Handlebars website](http://handlebarsjs.com/#html-escaping)

## Limitations

No known limitations.

----------------------------
**Version number:**  5.0.0   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>
**Framework versions:** 5.19.1+
**Author / maintainer:** 
**Accessibility support:** WAI AA
**RTL support:** No
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, IE11, Safari 12+13 for macOS/iOS/iPadOS, Opera
