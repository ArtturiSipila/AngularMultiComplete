angular.module('autocomplete', [])
    .directive('autocomplete', function ($parse, $http, $sce, $timeout) {

        // keyboard mappings
        var KEY_BACKSPACE = 8;
        var KEY_TAB = 9;
        var KEY_ENTER = 13;
        var KEY_ESCAPE = 27;
        var KEY_LEFT_ARROW = 37;
        var KEY_UP_ARROW = 38;
        var KEY_RIGHT_ARROW = 39;
        var KEY_DOWN_ARROW = 40;
        var KEY_DELETE = 46;

        return {
            restrict: 'EA',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'src/autocompleteTemplate.html';  //allow overwriting templateUrl with a user-given URL
            },
            scope: {
                "id": "@id",  //not obligatory but strongly recommended to everything work correctly
                "dataSource": "=datasource", //can be a value (array) or a function (if function it should provide a callback function first parameter and searchQuery as a second one)
                "additionalParams": "=", //additional parameter values for dataSource when dataSource is a function
                "placeholder": "@",
                "dataField": "@datafield",
                "multiSelect": "@",
                "removeSelected": "@", //remove selected value from dataSource,
                "showBrowseButton": "=?",
                "showSelectallButton": "=?",
                "dynamicBrowseButton": "@",  //overwrites showBrowseButton if present
                "initialValue": "@",
                "browseLimit": "@",  //this is for dynamic browse button, it this value is given then browse button will show if dataLength is less than this
                "dataLength": "@",   //if you can give number of (remote) items then we can use this information for browse button
                "disabled": "=",
                "selectedObject": "=selectedobject",  //can be a value or a function
                //"remoteUrl":"@",  //overrides datasource if both present
                "userPause": "@pause",
                "searchFields": "=searchfields",  //array of search fields
                "titleField": "@titlefield",  //consider renaming to 'displayField' or 'resultField'
                "minLengthUser": "@minlength",
                "clearOnSelection": "@",   //clear search query on selection event
                "multiselect": "@",   //enable multiselection
                //"onSelection":"&", //TODO: refactor the directive to use & when appropriate
                "onSelection": "=",
                "additionalCallbackParams": "="  //params added to onSelection etc. other callbacks
            },
            link: function (scope, element, attrs, ngModel) {
                scope.searching = false;
                scope.displayLimit = 8;  //the hard limit for cutting display items (items seen in the dropdown menu)
                scope.currentIndex = null;
                scope.mynamespace = "autocomplete";
                scope.matchClass = "highlight";

                var mousedownOn = null;
                element.on('mousedown', function (event) {
                    mousedownOn = event.target.id;
                });

                //set the default values
                scope.showBrowseButton = angular.isDefined(scope.showBrowseButton) ? scope.showBrowseButton : false;
                scope.showSelectallButton = angular.isDefined(scope.showSelectallButton) ? scope.showSelectallButton : false;
                scope.browseLimit = angular.isDefined(scope.browseLimit) ? scope.browseLimit : 5;

                var unwatchDataSource = scope.$watch('dataSource', function (val) {
                    scope.results = []; //clear results on dataSource change
                    scope.showDropdown = false;
                    if (scope.dynamicBrowseButton) {
                        scope.showBrowseButton = (scope.browseLimit >= scope.dataSource.length && scope.dataSource.length > 0);
                    }
                });

                var unwatchBrowseLimit = scope.$watch('browseLimit', function (val) {
                    if (scope.dynamicBrowseButton) {
                        scope.showBrowseButton = (scope.browseLimit >= scope.dataSource.length && scope.dataSource.length > 0);
                    }
                });

                scope.pause = 200;
                scope.minLength = 1;  //minlength internal
                
                if (scope.initialValue) scope.queryString = scope.initialValue;  // Set the possible initial value to query string

                var dataSourceIsRemote = (typeof scope.dataSource === 'function'); //possibly remote
                setSelectedObject(null);

                //override the default min length value with user given values
                if (scope.minLengthUser && scope.minLengthUser != "") {
                    scope.minLength = scope.minLengthUser;
                }

                //override the pause value with user given value
                if (scope.userPause) {
                    scope.pause = scope.userPause;
                }

                scope.keyPressedOnInputField = function (event) {

                    if (!(event.which == KEY_UP_ARROW || event.which == KEY_DOWN_ARROW) || (event.which == KEY_ENTER && !scope.results)) {

                        if (!scope.queryString || scope.queryString == "") {
                            scope.showDropdown = false;
                            scope.lastSearchTerm = null;

                        }
                        else if (isNewSearchNeeded(scope.queryString, scope.lastSearchTerm)) { //TODO: rename to : found in cache etc.
                            scope.lastSearchTerm = scope.queryString;
                            scope.showDropdown = true;
                            scope.currentIndex = -1;
                            scope.results = [];

                            if (scope.searchTimer) {
                                //cancel the current timer if we keep typing?
                                $timeout.cancel(scope.searchTimer);
                            }

                            scope.searching = true;

                            if (scope.searchTimer) {
                                $timeout.cancel(scope.searchTimer);
                            }

                            scope.searching = true;

                            scope.searchTimer = $timeout(function () {
                                scope.search(scope.queryString);
                            }, scope.pause);
                        }
                        else {
                            
                            //no search needed, show dropdown

                        }
                    }
                    else {
                        event.preventDefault();
                    }
                };

                //the idea loaned from angucomplete
                var isNewSearchNeeded = function (newTerm, oldTerm) {
                    return newTerm.length >= scope.minLength && newTerm != oldTerm
                };

                /* Setter for selected object, it may be a function or a value */
                function setSelectedObject(value) {
                    if (typeof scope.selectedObject === 'function') {
                        scope.selectedObject(value);
                    }
                    else {
                        if (scope.multiSelect) {
                            if (!angular.isArray(scope.selectedObject) || value == null) {  //initialize or clear the result array
                                scope.selectedObject = [];  //TODO: handle an existing value? is it possible?
                            }

                            if (value)
                                scope.selectedObject.push(value);
                        }
                        else {
                            scope.selectedObject = value;
                        }
                    }
                }


                scope.search = function (searchQuery) {
                    // Begin the search
                    if (searchQuery.length >= scope.minLength) {

                        //function can be used for remote calls
                        if (typeof scope.dataSource === 'function') {  //dataSource should provide a callback as first param and search query as second

                            scope.dataSource(function (responseData) {
                                console.log("responsedata ", responseData);
                                scope.processResults(responseData, searchQuery);
                                scope.searching = false;
                            }, searchQuery, scope.additionalParams);
                        }
                        else {  //local data

                            var searchFields = null;
                            var matches = [];

                            //if searchFields defined
                            if (typeof scope.searchFields !== 'undefined') {
                                searchFields = scope.searchFields;


                                for (var i = 0; i < scope.dataSource.length; i++) {
                                    var match = false;

                                    for (var s = 0; s < searchFields.length; s++) {
                                        match = match || (typeof scope.dataSource[i][searchFields[s]] === 'string' && typeof searchQuery === 'string' && scope.dataSource[i][searchFields[s]].toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0);
                                    }

                                    if (match) {
                                        matches[matches.length] = scope.dataSource[i];
                                    }
                                }
                            }
                            //if not searchFields defined, presume the source array is flat
                            else {
                                //console.error("Autocomplete error: No search field defined");
                                for (var i = 0; i < scope.dataSource.length; i++) {
                                    var match = false;
                                    
                                    //in this case the whole datasource must be a string so we can match to it
                                    match = match || (typeof scope.dataSource[i] === 'string' && typeof searchQuery === 'string' && scope.dataSource[i].toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0);

                                    if (match) {
                                        matches[matches.length] = scope.dataSource[i];
                                    }
                                }
                            }

                            scope.searching = false;
                            scope.processResults(matches, searchQuery);
                        }
                    }
                };

                scope.processResults = function (responseData, str) {
                    if (responseData && responseData.length > 0) {
                        scope.results = [];

                        var titleFields = [];
                        if (typeof scope.titleField !== 'undefined' && scope.titleField && scope.titleField != "") {
                            titleFields = scope.titleField.split(",");
                        }
                        else {
                            console.log("titlefield not defined");
                        }

                        for (var i = 0; i < responseData.length; i++) {
                            
                            // Get title variables
                            var titleCode = [];
                            var text;

                            if (typeof scope.titleField !== 'undefined') {
                                for (var t = 0; t < titleFields.length; t++) {
                                    //if (!responseData[i][titleFields[t]])  data has not given titlefield //TODO: error message
                                    titleCode.push(responseData[i][titleFields[t]]);
                                    text = titleCode.join(' ');
                                }
                            }
                            else { //no titlefield defined
                                text = responseData[i];
                            }

                            var description = "";
                            if (scope.descriptionField) {
                                description = responseData[i][scope.descriptionField];
                            }

                            var imageUri = "";
                            if (scope.imageUri) {
                                imageUri = scope.imageUri;
                            }

                            var image = "";
                            if (scope.imageField) {
                                image = imageUri + responseData[i][scope.imageField];
                            }

                            if (scope.matchClass && !dataSourceIsRemote) {   //Match highlight only in local data

                                var re = new RegExp(str, 'i');
                                var strPart = text.match(re)[0];
                                text = $sce.trustAsHtml(text.replace(re, '<span class="' + scope.matchClass + '">' + strPart + '</span>'));
                            }
                            else {
                                text = $sce.trustAsHtml(text);
                            }

                            scope.results[scope.results.length] = {
                                title: text,
                                originalObject: responseData[i]
                            };
                        }
                    } else {
                        scope.results = [];
                    }
                };

                scope.browse = function () {
                    scope.showDropdown = !scope.showDropdown;  //toggle browse

                    if (!scope.showDropdown) return;


                    //function can be used for remote calls
                    if (typeof scope.dataSource === 'function') {  //dataSource should provide a callback
                        scope.dataSource(function (responseData) {
                            scope.processResults(responseData, '');  //no searchQuery, is this ok?
                            scope.searching = false;
                        });
                    }
                    //local data
                    else {
                        scope.searching = false;
                        scope.processResults((scope.displayLimit < scope.dataSource.length) ? scope.dataSource.slice(0, scope.displayLimit) : scope.dataSource.slice(0, scope.dataSource.length), ".*");   // .* will match everything except new line and terminator
                    }
                };


                scope.hideResults = function () {
                    // don't hide the results if for example clicking on a scrollbar or some other element inside the autocomplete component
                    if (mousedownOn === scope.id + '_dropdown') {
                        mousedownOn = null;
                    }
                    else {
                        scope.hideTimer = $timeout(function () {
                            scope.showDropdown = false;
                        }, scope.pause);
                    }
                };

                scope.resetHideResults = function () {
                    if (scope.hideTimer) {
                        $timeout.cancel(scope.hideTimer);
                    }
                };

                scope.hoverRow = function (index) {
                    scope.currentIndex = index;
                };

                scope.selectResult = function (result, $event) {
                    if (scope.matchClass) {
                        if (result.title)
                            result.title = result.title.$$unwrapTrustedValue().toString().replace(/(<([^>]+)>)/ig, '');
                    }
                    scope.queryString = scope.lastSearchTerm = result.title;
                    setSelectedObject(result);

                    if (scope.onSelection)  //TODO: override this with an empty function at the beginning if it isn't defined
                        scope.onSelection(result, scope.additionalCallbackParams);

                    scope.showDropdown = false;

                    if (scope.clearOnSelection) {
                        scope.queryString = null;
                    }

                    scope.currentIndex = -1;
                };

                //Bind event listeners
                element.find('input').on('keyup', scope.keyPressedOnInputField);

                element.on("keyup", function (event) {

                    if (event.which === KEY_DOWN_ARROW) {

                        if (scope.results && (scope.currentIndex + 1) < scope.results.length) {
                            scope.currentIndex++;
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();

                        }

                        scope.$apply();
                    }
                    else if (event.which == KEY_UP_ARROW) {
                        if (scope.currentIndex >= 1) {
                            scope.currentIndex--;
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    }
                    else if (event.which == KEY_ENTER) {
                        if (scope.results && scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
                            scope.selectResult(scope.results[scope.currentIndex]);
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }
                    }
                    else if (event.which == KEY_ESCAPE) {
                        scope.results = [];
                        scope.showDropdown = false;
                        scope.$apply();
                    }
                    else if (event.which == KEY_BACKSPACE) {
                        setSelectedObject(null);
                        scope.$apply();
                    }
                    else {
                        scope.$apply();
                    }

                });

                //clean up
                element.on('$destroy', function () {
                    unwatchDataSource();
                    unwatchBrowseLimit();
                    $timeout.cancel(scope.searchTimer);
                    $timeout.cancel(scope.hideTimer);
                });
            }
        }
    });