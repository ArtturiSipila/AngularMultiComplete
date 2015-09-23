var test_app = angular.module('testapp', ["autocomplete"]);

/*
use templateCache if you feel like
test_app.run(function($templateCache){
    $templateCache.put("autocomplete.html", '<div></div>')
});
*/

test_app.controller('TestController', ['$scope', '$http',
        function TestController($scope, $http) {
           $scope.searchFieldsInData = ["color"];
           $scope.colors = [
                {
                    color: "red",
                    value: "#f00"
                },
                {
                    color: "green",
                    value: "#0f0"
                },
                {
                    color: "blue",
                    value: "#00f"
                },
                {
                    color: "cyan",
                    value: "#0ff"
                },
                {
                    color: "magenta",
                    value: "#f0f"
                },
                {
                    color: "yellow",
                    value: "#ff0"
                },
                {
                    color: "black",
                    value: "#000"
                },
                {
                    color: "pink",
                    value: "#FFC0CB"
                },
                {
                    color: "slategrey",
                    value: "#708090"
                }
            ];

            $scope.colors_flat = ["red", "green", "blue", "cyan", "magenta", "yellow", "black", "pink", "slategrey"];




            $scope.animals = [
                {
                    name: "horse",
                    latin_name: "Equus ferus caballus",
                    classification: {
                        phylum: "chordata",
                        class:"mammalia"
                    }
                },
                {
                    name: "african wilcat",
                    latin_name: "Felis silvestris lybica",
                    classification: {
                        phylum: "chordata",
                        class:"mammalia"
                    }
                },
                {
                    name: "great white shark",
                    latin_name: "carcharodon carcharias",
                    classification: {
                        phylum: "chordata",
                        class:"chondrichthyes"
                    }
                },
                {
                    name: "small carpenter ant",
                    latin_name: "camponotus nearcticus",
                    classification: {
                        phylum: "arthropoda",
                        class:"insecta"
                    }
                }
            ];

            //example 3:
            $scope.selectedItemFromCallBack = null;
            $scope.onAutoCompleteSelection = function(value) {
                console.log("onSelection: ",value);
                 $scope.selectedItemFromCallBack = value;
            };

            //example 4:
            $scope.example4Callback = function(value, additionalParams) {
                console.log("Example 4 callback got this value: ",value);
                console.log("Example 4 callback got these additional params : ",additionalParams);
                alert("Got this value: "+value.title);
            };


            $scope.example6_showBrowse = true;
            //example 7:
            $scope.example7_browseLimit = 5;
            $scope.example7_dataLength = 0;
            $scope.example7_dataSource = $scope.colors;
            $scope.example7_placeholder = "Search colors";
            $scope.item = "one two";
            $scope.example7_titlefield = "color";
            $scope.example7_searchfields = ["color"];
            $scope.example7_useColorData = function() {
                console.log("Use color data");
                $scope.example7_dataSource = $scope.colors;
                $scope.example7_placeholder = "Search colors";
                $scope.example7_titlefield = "color";
                $scope.example7_searchfields = ["color"];
            };

            $scope.example7_useAnimalData = function() {
                console.log("Use animal data");
                $scope.example7_dataSource = $scope.animals;
                $scope.example7_placeholder = "Search animals";
                $scope.example7_titlefield = "name";
                $scope.example7_searchfields = ["name"];

            };



            //example 8:
            $scope.example8_disabled = true;


            //example 14:
            //$http.get(scope.remoteUrl + searchQuery, {}).
            $scope.example14_getData = function(callback, searchQuery, additional) {
                console.log("Example14 got some additional params: ",additional);


                $http.jsonp("//api.duckduckgo.com/?format=json&callback=JSON_CALLBACK&pretty=1&q=" + searchQuery, {}).
                    success(function(responseData, status, headers, config) {
                        callback(responseData.RelatedTopics);
                        console.log("success: ",responseData.RelatedTopics);

                    }).
                    error(function(data, status, headers, config) {

                        console.error("http error");
                    });
            }


        }
    ]);
