'use strict';

describe('autocomplete', function() {
    var $compile, $scope, $timeout;

    beforeEach(module('autocomplete'));
    beforeEach(module("my.templates"));    // load new module containing templates

    beforeEach(inject(function(_$compile_, $rootScope, _$timeout_) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
    }));



    describe('Render', function() {

        it('should render input element with given id plus _value', function() {
            $scope.searchFieldsInData = ["name"];
            //var element = angular.element('<div autocomplete id="test1" ng-model="selectedItem" selectedobject="selectedItem" dataSource="colors" searchFields="searchFieldsInData" titlefield="color"></div>');
            var element = angular.element('<autocomplete id="test1" selectedobject="selectedItem" dataSource="colors" searchFields="searchFieldsInData" titlefield="color" ></autocomplete>');
            $scope.selectedItem = null;
            $compile(element)($scope);
            $scope.$digest();
            expect(element.find('#test1_value').length).toBe(1);
        });

        it('should render placeholder string', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="ex1" selectedobject="selectedItem" dataSource="colors" searchfields="name" titlefield="name" placeholder="Search colors"/>');
            $scope.selectedItem = null;
            $compile(element)($scope);
            $scope.$digest();
            expect(element.find('#ex1_value').attr('placeholder')).toEqual('Search colors');
        });

    });

    describe('Local data', function() {

        it('should show search results after 2 letters are entered', function() {

            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="ex1" placeholder="Search countries"  selectedobject="selectedCountry" dataSource="countries" searchFields="searchFieldsInData" titlefield="name"></div>');
            $scope.selectedCountry = undefined;
            $scope.countries = [
                {name: 'Afghanistan', code: 'AF'},
                {name: 'Aland Islands', code: 'AX'},
                {name: 'Albania', code: 'AL'}
            ];
            $compile(element)($scope);
            $scope.$digest();
            var inputField = element.find('#ex1_value');
            var e = $.Event('keyup');
            e.which = 97; // letter: a

            inputField.val('a');
            inputField.trigger('input');
            inputField.trigger(e);
            expect(element.find('#ex1_dropdown').length).toBe(0);

            inputField.val('aa');
            inputField.trigger('input');
            inputField.trigger(e);
            expect(element.find('#ex1_dropdown').length).toBe(1);

            inputField.val('aaa');
            inputField.trigger('input');
            inputField.trigger(e);
            $timeout.flush();
            expect(element.find('#ex1_dropdown').length).toBe(1);
        });

        it('should show search results after 1 letter is entered with minlength being set to 1', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="ex1" placeholder="Search countries" selectedobject="selectedCountry" dataSource="countries" searchfields="searchFieldsInData" titlefield="name" minlength="1"/>');
            $scope.selectedCountry = undefined;
            $scope.countries = [
                {name: 'Afghanistan', code: 'AF'},
                {name: 'Aland Islands', code: 'AX'},
                {name: 'Albania', code: 'AL'}
            ];
            $compile(element)($scope);
            $scope.$digest();
            var inputField = element.find('#ex1_value');
            var e = $.Event('keyup');
            e.which = 97; // letter: a
            inputField.val('a');
            inputField.trigger('input');
            inputField.trigger(e);
            $timeout.flush();
            expect(element.find('#ex1_dropdown').length).toBe(1);
        });

    });
   
    describe('processResults', function() {

        it('should set $scope.results[0].title', function() {
            var element = angular.element('<autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="name" titlefield="name" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var name = 'John';
            var responseData = [ {name: name} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].title.$$unwrapTrustedValue()).toBe(name);
        });

        it('should set $scope.results[0].title for two title fields', function() {
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="name" titlefield="firstName,lastName" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var lastName = 'Doe', firstName = 'John';
            var responseData = [ {lastName: lastName, firstName: firstName} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].title).toBe(firstName + ' ' + lastName);
        });

        it('should set $scope.results[0].description', function() {
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="name" titlefield="name" descriptionfield="desc" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var description = 'blah blah blah';
            var responseData = [ {name: 'John', desc: description} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].description).toBe(description);
        });

        it('should set $scope.results[0].image', function() {
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="name" titlefield="name" imagefield="pic" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var image = 'some pic';
            var responseData = [ {name: 'John', pic: image} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].image).toBe(image);
        });

        it('should set $scope.results[0].image with uri', function() {
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="name" titlefield="name" imageuri="http:localhost/images/" imagefield="pic" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var image = 'some pic';
            var responseData = [ {name: 'John', pic: image} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].image).toBe('http:localhost/images/' + image);
        });
    });

    describe('searchTimerComplete', function() {

        describe('local data', function() {
            it('should set $scope.searching to false and call $scope.processResults', function() {
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search countries" selectedobject="selectedCountry" dataSource="countries" searchfields="name" titlefield="name" minlength="1"/>');
                $scope.selectedCountry = undefined;
                $scope.countries = [
                    {name: 'Afghanistan', code: 'AF'},
                    {name: 'Aland Islands', code: 'AX'},
                    {name: 'Albania', code: 'AL'}
                ];
                $compile(element)($scope);
                $scope.$digest();

                var queryTerm = 'al';
                spyOn(element.isolateScope(), 'processResults');
                element.isolateScope().searchTimerComplete(queryTerm);
                expect(element.isolateScope().processResults).toHaveBeenCalledWith($scope.countries.slice(1,3), queryTerm);
            });
        });

        describe('remote API', function() {

            it('should call $http with given url and param', inject(function($httpBackend) {
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" url="names?q=" searchfields="name" datafield="data" titlefield="name" minlength="1"/>');
                $compile(element)($scope);
                $scope.$digest();

                var queryTerm = 'john';
                var results = {data: [{name: 'john'}]};
                spyOn(element.isolateScope(), 'processResults');
                $httpBackend.expectGET('names?q=' + queryTerm).respond(200, results);
                element.isolateScope().searchTimerComplete(queryTerm);
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            }));

            it('should set $scope.searching to false and call $scope.processResults after success', inject(function($httpBackend) {
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" url="names?q=" searchfields="name" datafield="data" titlefield="name" minlength="1"/>');
                $compile(element)($scope);
                $scope.$digest();

                var queryTerm = 'john';
                var results = {data: [{name: 'john'}]};
                spyOn(element.isolateScope(), 'processResults');
                $httpBackend.expectGET('names?q=' + queryTerm).respond(200, results);
                element.isolateScope().searchTimerComplete(queryTerm);
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
                expect(element.isolateScope().processResults).toHaveBeenCalledWith(results.data, queryTerm);
                expect(element.isolateScope().searching).toBe(false);
            }));
        });
    });

});
