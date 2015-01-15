var test_app = angular.module('testapp', ["autocomplete"]);

/*
test_app.run(function($templateCache){
    $templateCache.put("autocomplete.html", '<div></div>')
});
*/

test_app.controller('TestController', ['$scope',
        function TestController($scope) {
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
                }
            ];

            //example 3:
            $scope.selectedItemFromCallBack = null;
            $scope.onAutoCompleteSelection = function(value) {
                console.log("onSelection: ",value);
                 $scope.selectedItemFromCallBack = value;
            };

            //example 4:
            $scope.example4Callback = function(value) {
                console.log("Example 4 callback got this value: ",value);
                alert("Got this value: "+value.title);
            };
        }
    ]);
