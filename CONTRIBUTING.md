# Contributing to LaxarJS

Thank you very much for your interest in becoming involved with the development of the LaxarJS project!
By following the suggestions of this document, you ensure that your concerns can be addressed as quickly as possible.


## Code of Conduct

Within the LaxarJS community, everyone is expected to treat each other with respect.
It boils down to _"be respectful, be professional"_.
In case you are in doubt over what that means, the [Django project Code of Conduct](https://www.djangoproject.com/conduct/) and [FAQ](https://www.djangoproject.com/conduct/faq/) do a great job of covering the details, and serve as a guideline to the LaxarJS project.


## Raising an Issue

Whether or not you would like to submit a pull request, we would ask you to _first open an issue_ on our GitHub tracker in order to start a discussion on the improvement you would like to have.
Of course, you are encouraged to skip this step if there already is an issue for your concern.
However, we would ask that you get in touch before starting implementation of any non-trivial feature on your own.

Try to give the issue a **title** that communicates well what it is about:

  * good: _"Exception when publishing navigateRequest on iOS Safari"_

  * bad: _"Site broke on my friend's phone"_

Use the **description** to tell us exactly how to reproduce the problem, and (especially for enhancements) what you would expect instead.
Most importantly, we would ask you to tell us the exact **version** (tag or commit-hash) of LaxarJS you were using that contains the bug / is missing the feature you are refering to.
You can find out the version by looking at the `bower.json`.
If you have an issue with a different artifact (e.g. with _laxar-patterns_ or with a widget), please make sure to use the corresponding GitHub issue tracker and artifact version.

You _can_ use an **issue label** to mark the issue as one of:

  * _bug_: something that is broken and should be fixed in an upcoming patch version

  * _enhancement_: a new feature that should be included in an upcoming minor version

  * _breaking_ change: something that may break compatibility and must be released in a new major version

Please understand that we will sometimes edit issue fields to make them fit with our workflow.


## Filing the CLA

For legal reasons (protection against copyright/patent lawsuits) we cannot use contributions right away.
In order for us to be able to accept your contribution, we have to ask that you fill out and submit our _Contributor License Agreement_ (CLA).
There are two versions of the CLA:

  * [CLA for individuals](docs/contributing/laxarjs-cla-for-individual.pdf) (spare-time contributors etc.)

  * [CLA for other entities](docs/contributing/laxarjs-cla-for-entity.pdf) (organizations, corporations, etc.)

Right now, we can only accept CLAs with a **handwritten signature**, which you can send in by scan+email (preferred), snail mail or fax:

  * email: [info@laxarjs.org](mailto:info@laxarjs.org)

  * Postal Address: _Markus Kemmann, c/o aixigo AG, Karl-Friedrich-Str. 68, 52072 Aachen, Germany_

  * Fax Number: _(+49) 241 559 709 99_

With the legal concerns taken care of, it is time to actually prepare your contribution.


## Submitting a Pull-Request

Great! You are ready to prepare a solution for your problem.
Please make sure that your code changes take into account our [styleguide](https://github.com/LaxarJS/laxar/blob/master/docs/contributing/styleguide.md#laxarjs-coding-styles).
_Fork_ our repository and put your solution onto a branch, preferably as a single commit.

Your commit must add a single entry to the top of the `CHANGELOG.md` referencing the GitHub issue that you (or somebody else) already created, and explaining in short words what the change does.
Prefix the commit-message with the **issue ID** (e.g. `(#42) `) to make it easy to find your solution when looking at the issue on GitHub.
If possible, base your commit on the latest _master_ branch of the repository in question.
For bugfixes, the corresponding _release-?.?.x_ branch is also a good option.

Next, you are welcome to _open a pull-request_ against our Fork.
Please put the *issue ID in the title*, too.
Make sure to understand that we treat each pull-request as a *discussion* around a proposed solution.
There may be several iterations before a solution is accepted for merging into the upstream repository.

Thanks for taking the time to read this guide, we are looking forward to your contribution!
