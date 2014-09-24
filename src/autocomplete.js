/**
 * Created by Artturi Sipilä on 24.9.2014.
 */


angular.module('autocomplete', [] )
    .directive('autocomplete', function ($parse, $http, $sce, $timeout) {
        return {
            restrict: 'EA',
            templateUrl: 'src/autocompleteTemplate.html',
            scope: {}, // http://stackoverflow.com/questions/14050195/what-is-the-difference-between-and-in-directive-scope
            link: function($scope, element, attrs) {
                var input = element.find('input');


                //function declarations

                $scope.keyPressed = function(event) {
                    if (!(event.which == 38 || event.which == 40 || event.which == 13)) {

                        $scope.showDropdown = true;
                        /*

                        if (!$scope.searchStr || $scope.searchStr == "") {
                            $scope.showDropdown = false;
                            $scope.lastSearchTerm = null
                        } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                            $scope.lastSearchTerm = $scope.searchStr
                            $scope.showDropdown = true;
                            $scope.currentIndex = -1;
                            $scope.results = [];

                            if ($scope.searchTimer) {
                                $timeout.cancel($scope.searchTimer);
                            }

                            $scope.searching = true;

                            $scope.searchTimer = $timeout(function() {
                                $scope.searchTimerComplete($scope.searchStr);
                            }, $scope.pause);
                        }
                        */
                    } else {
                        event.preventDefault();
                    }
                };


                //Bind event listeners


                input.on('keyup', $scope.keyPressed);
                element.on("keyup", function (event) {

                    /*
                    if(event.which === 40) {
                        if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                            $scope.currentIndex ++;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                        $scope.$apply();
                    } else if(event.which == 38) {
                        if ($scope.currentIndex >= 1) {
                            $scope.currentIndex --;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 13) {
                        if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                            $scope.selectResult($scope.results[$scope.currentIndex]);
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        } else {
                            $scope.results = [];
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 27) {
                        $scope.results = [];
                        $scope.showDropdown = false;
                        $scope.$apply();
                    } else if (event.which == 8) {
                        $scope.selectedObject = null;
                        $scope.$apply();
                    }
                    */
            });
        }
        }
    });