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


    describe('Template rendering', function() {

        it('should render input element with given id plus _value', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="test1" selectedobject="selectedItem" dataSource="colors" searchFields="searchFieldsInData" titlefield="color"></autocomplete>');
            $scope.selectedItem = null;
            $compile(element)($scope);
            $scope.$digest();
            expect(element.find('#test1_value').length).toBe(1);
        });

        it('should render placeholder string', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="ex1" selectedobject="selectedItem" dataSource="colors" searchfields="searchFieldsInData" titlefield="name" placeholder="Search colors"/>');
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
            expect(element.find('#ex1_dropdown').length).toBe(1);

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
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="searchFieldsInData" titlefield="name" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var name = 'Jonathan';
            var responseData = [ {name: name} ];
            element.isolateScope().processResults(responseData);
            //expect(element.isolateScope().results[0].title.$$unwrapTrustedValue()).toBe(name);
            expect(element.isolateScope().results[0].title.$$unwrapTrustedValue()).toBe('<span class="highlight"></span>'+name);
        });

        it('should set $scope.results[0].title for two title fields', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="searchFieldsInData" titlefield="firstName,lastName" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var lastName = 'Doe', firstName = 'Jonathan';
            var responseData = [ {lastName: lastName, firstName: firstName} ];
            element.isolateScope().processResults(responseData);
            expect(element.isolateScope().results[0].title.$$unwrapTrustedValue()).toBe('<span class="highlight"></span>'+firstName + ' ' + lastName);
        });

        it('should NOT set $scope.results[0].description (DISABLED FEATURE)', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="searchFieldsInData" titlefield="name" descriptionfield="desc" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var description = 'blah blah blah';
            var responseData = [ {name: 'Jonathan', desc: description} ];
            element.isolateScope().processResults(responseData);
            //expect(element.isolateScope().results[0].description).toBe(description);
            expect(element.isolateScope().results[0].description).toBeUndefined();
        });

        it('should NOT set $scope.results[0].image (DISABLED FEATURE)', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="searchFieldsInData" titlefield="name" imagefield="pic" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var image = 'some pic';
            var responseData = [ {name: 'Jonathan', pic: image} ];
            element.isolateScope().processResults(responseData);
            //expect(element.isolateScope().results[0].image).toBe(image);
            expect(element.isolateScope().results[0].image).toBeUndefined();
        });

        it('should NOT set $scope.results[0].image with uri (DISABLED FEATURE)', function() {
            $scope.searchFieldsInData = ["name"];
            var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" selectedobject="selected" dataSource="names" searchfields="searchFieldsInData" titlefield="name" imageuri="http:localhost/images/" imagefield="pic" minlength="1"/>');
            $compile(element)($scope);
            $scope.$digest();

            var image = 'some pic';
            var responseData = [ {name: 'Jonathan', pic: image} ];
            element.isolateScope().processResults(responseData);
            //expect(element.isolateScope().results[0].image).toBe('http:localhost/images/' + image);
            expect(element.isolateScope().results[0].image).toBeUndefined();
        });
    });

    describe('Process results', function() {

        describe('local data', function() {
            it('should set $scope.searching to false and call $scope.processResults', function() {
                $scope.searchFieldsInData = ["name"];
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search countries" selectedobject="selectedCountry" dataSource="countries" searchfields="searchFieldsInData" titlefield="name" minlength="1"/>');
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
                element.isolateScope().search(queryTerm);
                //expect($scope.searching).toBe(false);
                expect(element.isolateScope().processResults).toHaveBeenCalledWith($scope.countries.slice(1,3), queryTerm);
            });
        });

        describe('remote API', function() {

            it('should call $http with given url and param', inject(function($httpBackend) {
                $scope.remoteFunction = function() {
                    console.log("some fake $http call has been made");
                }
                spyOn($scope, 'remoteFunction');
                $scope.searchFieldsInData = ["name"];
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" dataSource="remoteFunction" selectedobject="selected" url="names?q=" searchfields="searchFieldsInData" datafield="data" titlefield="name" minlength="1"/>');
                $compile(element)($scope);
                $scope.$digest();

                var queryTerm = 'Jonathan';
                var results = {data: [{name: 'Jonathan'}]};
                spyOn(element.isolateScope(), 'processResults');
                /*
                $httpBackend.expectGET('names?q=' + queryTerm).respond(200, results);
                */
                element.isolateScope().search(queryTerm);
                /*
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
                */
                expect($scope.remoteFunction).toHaveBeenCalled();
            }));

            it('should set $scope.searching to false and call $scope.processResults after success', inject(function($httpBackend) {
                var results = {data: [{name: "item 1"}, {name: "item 2"}] };
                $scope.remoteFunction = function(callback, searchQuery, additionalParams) {
                    console.log("some fake $http call has been made");
                    callback(  results.data ); 
                }
                
                $scope.searchFieldsInData = ["name"];
                var element = angular.element('<div autocomplete id="ex1" placeholder="Search names" dataSource="remoteFunction" selectedobject="selected" url="names?q=" searchfields="searchFieldsInData" datafield="data" titlefield="name" minlength="1"/>');
                $compile(element)($scope);
                $scope.$digest();

                var queryTerm = 'item';
                
                spyOn(element.isolateScope(), 'processResults');
                /*
                $httpBackend.expectGET('names?q=' + queryTerm).respond(200, results);
                */
                element.isolateScope().search(queryTerm);
                /*
                $httpBackend.flush();
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
                */
                expect(element.isolateScope().processResults).toHaveBeenCalledWith(results.data, queryTerm);
                expect(element.isolateScope().searching).toBe(false);
            }));
        });
    });

});
