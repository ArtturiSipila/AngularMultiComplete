angular.module('autocomplete', [] )
    .directive('autocomplete', function ($parse, $http, $sce, $timeout) {


        // keyboard mappings
        var KEY_BACKSPACE   =  8;
        var KEY_TAB         =  9;
        var KEY_ENTER       = 13;
        var KEY_ESCAPE      = 27;
        var KEY_LEFT_ARROW  = 37;
        var KEY_UP_ARROW    = 38;
        var KEY_RIGHT_ARROW = 39;
        var KEY_DOWN_ARROW  = 40;
        var KEY_DELETE      = 46;

        return {
            restrict: 'EA',
            templateUrl: 'src/autocompleteTemplate.html',
            scope: {
                "placeholder": "@placeholder",
                //"searchFields": "@searchfields"  //array of search fields
                "selectedObject": "=selectedobject",
                "dataSource": "=datasource",
                "searchFields": "=searchfields",  //array of search fields
                "titleField": "@titlefield"  //TODO: rename to display field or resultField
            }, // http://stackoverflow.com/questions/14050195/what-is-the-difference-between-and-in-directive-scope
            link: function(scope, element, attrs) {
                scope.displayLimit = 8;
                scope.currentIndex = null;
                scope.mynamespace = "angucomplete";
                scope.matchClass = "highlight";
                var input = element.find('input');
                //var browseBtn = element.find('button'); //change this to an id selector if we have more buttons
                //scope.localData = true;
                scope.minLength = 1;
                //scope.showDropdown = false;

                //function declarations

                scope.keyPressed = function(event) {
                    if (!(event.which == KEY_UP_ARROW || event.which == KEY_DOWN_ARROW || event.which == KEY_ENTER)) {

                        scope.showDropdown = true;

                        if (!scope.queryString || scope.queryString == "") {
                            console.log("Empty search string");
                            scope.showDropdown = false;
                            scope.lastSearchTerm = null;

                        }
                        else if (isNewSearchNeeded(scope.queryString, scope.lastSearchTerm)) { //TODO: rename to : found in cache etc.
                            console.log("Search needed");
                            scope.lastSearchTerm = scope.queryString;
                            scope.showDropdown = true;
                            scope.currentIndex = -1;
                            scope.results = [];

                            /*
                            if (scope.searchTimer) {
                                $timeout.cancel(scope.searchTimer);
                            }
                            */

                            scope.searching = true;

                            /*
                            scope.searchTimer = $timeout(function() {
                                scope.searchTimerComplete(scope.queryString);
                            }, scope.pause);
                            */

                            scope.search(scope.queryString);
                        }

                    }
                    else {
                        console.log("Prevent default");
                        event.preventDefault();
                    }
                };


                //from angucomplete
                /*
                isNewSearchNeeded = function(newTerm, oldTerm) {
                    return newTerm.length >= scope.minLength && newTerm != oldTerm
                }
                */

                //TODO
                var isNewSearchNeeded = function(a, b) {
                    return true;
                };


                scope.search = function(searchQuery) {
                    // Begin the search

                    if (searchQuery.length >= scope.minLength) {
                        if (scope.dataSource) {  //TODO if dataSource on tyyppiä array

                            //var searchFields = scope.searchFields.split(",");
                            var searchFields = null;
                            if (typeof scope.searchFields !== 'undefined') {
                                searchFields = scope.searchFields;
                            }
                            else {
                                console.error("Autocomplete error: No search field defined");
                            }

                            var matches = [];

                            //console.log("searchfields: "+ searchFields);
                            //console.log("searchfields: "+ searchFields.length);
                            //console.log("localData: "+ scope.dataSource);
                            //console.log("localData[0]: "+ scope.dataSource[0]);

                            for (var i = 0; i < scope.dataSource.length; i++) {
                                var match = false;

                                for (var s = 0; s < searchFields.length; s++) {
                                    match = match || (typeof scope.dataSource[i][searchFields[s]] === 'string' && typeof searchQuery === 'string' && scope.dataSource[i][searchFields[s]].toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0);
                                }

                                if (match) {
                                    console.log("match");
                                    matches[matches.length] = scope.dataSource[i];
                                }
                            }

                            scope.searching = false;
                            scope.processResults(matches, searchQuery);

                        } else {
                            $http.get(scope.url + searchQuery, {}).
                                success(function(responseData, status, headers, config) {
                                    scope.searching = false;
                                    scope.processResults(((scope.dataField) ? responseData[scope.dataField] : responseData ), searchQuery);
                                }).
                                error(function(data, status, headers, config) {
                                    console.log("error");
                                });
                        }
                    }

                };

                scope.processResults = function(responseData, str) {
                    console.log("ProcessResults: ", responseData, " str: ",str);
                    if (responseData && responseData.length > 0) {
                        scope.results = [];

                        var titleFields = [];
                        if (scope.titleField && scope.titleField != "") {
                            titleFields = scope.titleField.split(",");
                        }

                        for (var i = 0; i < responseData.length; i++) {
                            // Get title variables
                            var titleCode = [];

                            for (var t = 0; t < titleFields.length; t++) {
                                titleCode.push(responseData[i][titleFields[t]]);
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

                            var text = titleCode.join(' ');

                            if (scope.matchClass) {
                                var re = new RegExp(str, 'i');

                                var strPart = text.match(re)[0];

                                //console.log("text: ",strPart);
                                text = $sce.trustAsHtml(text.replace(re, '<span class="' + scope.matchClass + '">' + strPart + '</span>'));
                                //onsole.log("text: ",text);
                            }

                            scope.results[scope.results.length] = {
                                title: text,
                                description: description,
                                image: image,
                                originalObject: responseData[i]
                                };
                        }


                    } else {
                        scope.results = [];
                    }

                    console.log("RESULTS: ", scope.results);
                };

                scope.browse = function () {
                    console.log("Browse!");
                    scope.showDropdown = true;

                    if (scope.dataSource) {  //TODO if dataSource on tyyppiä array

                        scope.searching = false;
                        scope.processResults(  (scope.displayLimit < scope.dataSource.length) ? scope.dataSource.slice(0,scope.displayLimit) : scope.dataSource.slice(0,scope.dataSource.length)  , ".*");   // .* will match everything except new line and terminator

                    }
                    else { //TODO
                        $http.get(scope.url + searchQuery, {}).
                            success(function (responseData, status, headers, config) {
                                scope.searching = false;
                                scope.processResults(((scope.dataField) ? responseData[scope.dataField] : responseData ), " ");
                            }).
                            error(function (data, status, headers, config) {
                                console.log("error");
                            });
                    }
            };


                scope.hideResults = function() {
                    scope.hideTimer = $timeout(function() {
                        scope.showDropdown = false;
                    }, scope.pause);
                };

                scope.resetHideResults = function() {
                    if(scope.hideTimer) {
                        $timeout.cancel(scope.hideTimer);
                    };
                };

                scope.hoverRow = function(index) {
                    scope.currentIndex = index;
                };

                scope.selectResult = function(result) {
                    console.log("selectResult: ",result);
                    console.log("selectResult.title: ",result.title.$$unwrapTrustedValue());
                    //console.log("selectResult.title: ",result.originalObject.title);
                    if (scope.matchClass) {
                        result.title = result.title.$$unwrapTrustedValue().toString().replace(/(<([^>]+)>)/ig, '');
                    }
                    console.log("unwrapped title: ", result.title);
                    scope.queryString = scope.lastSearchTerm = result.title;
                    scope.selectedObject = result;
                    scope.showDropdown = false;
                    scope.results = [];
                    //$scope.$apply();
                };

                //Bind event listeners

                input.on('keyup', scope.keyPressed);
                //browseBtn.on('click', scope.browse);

                element.on("keyup", function (event) {


                    if(event.which === KEY_DOWN_ARROW) {
                        if (scope.results && (scope.currentIndex + 1) < scope.results.length) {
                            scope.currentIndex ++;
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                        scope.$apply();
                    }
                    else if(event.which == KEY_UP_ARROW) {
                        if (scope.currentIndex >= 1) {
                            scope.currentIndex --;
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
                        } else {
                            scope.results = [];
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
                        scope.selectedObject = null;
                        scope.$apply();
                    }
                    else {
                        scope.$apply();
                    }

            });

                //TODO: cleanup
                element.on('$destroy', function() {
                    //$interval.cancel(timeoutId);
                });
        }
        }
    });