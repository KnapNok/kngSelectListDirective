/**
 * Directive that behaves like a select list, opening a list with items in modal
 * It wraps over the element that opens the modal
 *
 * @param title {str} - title to display in header
 * @param empty-item-id {int} - ID of the item that should be treated as 'not selected',
 *                      most often something like 'Please select...'
 *                      Item with this id will be removed from the list hence non selectable
 * @param sort {bool} - should sort alphabetically if options are provided as object (not array)
 * @param ng-model {ngModel}
 * @param options {array|object}
 * @param item-text-field {string} - The name of the field in the options object and model that should be used for
 *                      displaying the TITLE of the item
 * @param item-id-field {string} - The name of the field in the options object and model that should be used as
 *                      ID of the item
 */

(function () {
    'use strict';
    var module;
    try {
        module = angular.module('kngIonic');
    } catch (e) {
        module = angular.module('kngIonic', []);
    }

    module.directive('kngSelectList', [
        '$rootScope', '$timeout', '$templateCache', '$ionicModal',
        function (
            $rootScope, $timeout, $templateCache, $ionicModal
        ) {
            $templateCache.put('selectDirectiveModal.html',
                '<ion-modal-view class="view-bg">' +
                    '<ion-header-bar class="bar-positive">' +
                        '<button class="button back-button buttons button-clear header-item"' +
                        'ng-if="!hideCloseButton"' +
                        'ng-click="closeSelect()"><i class="icon ion-ios-arrow-back"></i>' +
                        '<span class="back-text" style="transform: translate3d(0px, 0px, 0px);"><span class="default-title">&nbsp;Back</span></span>' +
                        '</button>' +
                        '<h1 class="title">{{title}}</h1>' +
                    '</ion-header-bar>' +
                    '<ion-content on-scroll="onScroll()">' +
                        '<br>' +
                        '<ion-list class="category-list">' +
                            '<ion-item class="item-icon-right"' +
                                    ' ng-repeat="key in keys track by $index"' +
                                    ' ng-init="item = options[key]"'  +
                                    ' ng-click="select(item)">' +
                                    '{{item[textField]}}' +
                                '<i ng-if="item[idField] == selectedId" class="icon ion-ios-checkmark-empty" style="font-size:40px"></i>' +
                            '</ion-item>' +
                        '</ion-list>' +
                    '</ion-content>' +
                '</ion-modal-view>'
            );
            return {
                restrict: 'E',
                template: '<div ng-click="openSelect()" ng-transclude></div>',
                scope: {
                    options: '=',
                },
                transclude: true,
                require: 'ngModel',
                link: function ($scope, $element, $attrs, $ngModel) {
                    var selectModal = null;
                    $scope.emptyId = 0;
                    $scope.title = 'Please select';
                    $scope.keys = [];
                    var time = false;

                    $scope.onScroll = function () {
                        time = new Date().getTime();
                    };

                    $scope.openSelect = function () {
                        $ionicModal.fromTemplateUrl('selectDirectiveModal.html', {
                            scope: $scope,
                            animation: 'slide-in-right'
                        }).then(function (modal) {
                            selectModal = modal;
                            selectModal.show();
                        });
                    };

                    $scope.select = function (selected) {
                        if (new Date().getTime() - time > 150) {
                            $ngModel.$setViewValue(selected);
                            $scope.hideCloseButton = parseInt($ngModel.$modelValue[$scope.idField]) === $scope.emptyId;
                            $scope.selected = $ngModel.$modelValue[$scope.textField];
                            $scope.selectedId = $ngModel.$modelValue[$scope.idField];
                            $scope.closeSelect();
                        }
                    };

                    $scope.closeSelect = function () {
                        selectModal.remove();
                    };

                    /**
                     * Extracts the keys from options object/array, removes empty item and optionally sorts
                     */
                    var extractKeys = function () {
                        var tmp = JSON.parse(JSON.stringify($scope.options));
                        for (var x in tmp) {
                            if (tmp.hasOwnProperty(x) && parseInt(tmp[x][$scope.idField]) === $scope.emptyId) {
                                if (typeof(tmp) === 'object') {
                                    delete tmp[x];

                                } else {
                                    tmp.slice(x, 1);
                                }
                            }
                        }

                        if (typeof($attrs.sort) !== 'undefined' && $attrs.sort === 'true') {
                            if (typeof(tmp) === 'object') {
                                tmp = Object.keys(tmp).map(function (key) {
                                    return tmp[key];
                                });
                            }
                            tmp.sort(function (a, b) {
                                return a[$scope.textField].localeCompare(b[$scope.textField]);
                            });
                            $scope.keys = tmp.map(function (item) {
                                return parseInt(item[$scope.idField]);
                            });

                        } else {
                            $scope.keys = Object.keys(tmp);
                        }
                    };

                    var bindEvents = function () {

                    };

                    var addWatches = function () {
                        $scope.$watch('options', function () {
                            extractKeys();
                        });
                    };

                    var init = function () {
                        bindEvents();
                        addWatches();
                        if ($attrs.title) {
                            $scope.title = $attrs.title;
                        }
                        if (typeof($attrs.itemTextField) === 'undefined') {
                            $scope.textField = 'text';

                        } else {
                            $scope.textField = $attrs.itemTextField;
                        }

                        if (typeof($attrs.itemIdField) === 'undefined') {
                            $scope.idField = 'id';

                        } else {
                            $scope.idField = $attrs.itemIdField;
                        }
                        if ($attrs.emptyItemId) {
                            $scope.emptyId = parseInt($attrs.emptyItemId);
                        }

                        $timeout(function () {
                            $scope.selected = $ngModel.$modelValue[$scope.textField];
                            $scope.selectedId = $ngModel.$modelValue[$scope.idField];

                            var modelValue = parseInt($ngModel.$modelValue[$scope.idField]);
                            $scope.hideCloseButton = modelValue === $scope.emptyId;
                            if ($attrs.autoInitOnEmpty && modelValue === $scope.emptyId) {
                                $scope.openSelect();
                            }
                        });
                    };

                    init();
                }
            };
        }]);
})();
