angular.module('autocomplete', [] )
    .directive('autocomplete', function ($parse, $http, $sce, $timeout) {
        return {
            restrict: 'EA',
            templateUrl: 'src/autocompleteTemplate.html',
            scope: {}, // http://stackoverflow.com/questions/14050195/what-is-the-difference-between-and-in-directive-scope
            link: function(scope, element, attrs) {
                var input = element.find('input');
                var browseBtn = element.find('button'); //change this to an id selector if we have more buttons

                scope.showDropdown = false;
                //function declarations

                scope.keyPressed = function(event) {
                    if (!(event.which == 38 || event.which == 40 || event.which == 13)) {

                        scope.showDropdown = true;


                        if (!scope.queryString || scope.queryString == "") {
                            console.log("Empty search string");
                            scope.showDropdown = false;
                            scope.lastSearchTerm = null


                        } else if (isNewSearchNeeded(scope.queryString, scope.lastSearchTerm)) { //TODO: rename to : found in cache etc.
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
                        }

                    } else {
                        event.preventDefault();
                    }
                };

                //TODO
                var isNewSearchNeeded = function(a, b) {
                    return true;
                };

                scope.browse = function(event) {
                    console.log("Browse!");
                };

                //Bind event listeners

                input.on('keyup', scope.keyPressed);
                browseBtn.on('click', scope.browse);

                element.on("keyup", function (event) {

                    /*
                    if(event.which === 40) {
                        if (scope.results && (scope.currentIndex + 1) < scope.results.length) {
                            scope.currentIndex ++;
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                        scope.$apply();
                    } else if(event.which == 38) {
                        if (scope.currentIndex >= 1) {
                            scope.currentIndex --;
                            scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 13) {
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

                    } else if (event.which == 27) {
                        scope.results = [];
                        scope.showDropdown = false;
                        scope.$apply();
                    } else if (event.which == 8) {
                        scope.selectedObject = null;
                        scope.$apply();
                    }
                    */
            });

                //TODO: cleanup
                element.on('$destroy', function() {
                    //$interval.cancel(timeoutId);
                });
        }
        }
    });