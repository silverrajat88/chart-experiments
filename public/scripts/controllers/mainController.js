$(function() {
    $('[data-toggle="tooltip"]').tooltip();
});

(function (app) {

    app.controller('mainController', ['$scope', '$route','$rootScope','myService', mainController]);

    function mainController($scope, $route, $rootScope,myService) {

        var hem = myService.hem,
        material_coatings = hem.result.material_coatings,
        materials =  hem.result.materials,
        coatings = hem.result.coatings,

        solidWoodMaterialCoatings = _.filter( material_coatings, function(item){ return item.identifier == "solid_wood"; }),
        mdfWithVeenerMaterialCoatings = _.filter( material_coatings, function(item){ return item.identifier == "mdf_veener"; }),
        hemColorsMaterialCoatings = _.filter( material_coatings, function(item){ return item.identifier == "hem_selected_color"; }),
        hemColorsMaterialIds = _.map(hemColorsMaterialCoatings, function(item){ return item.material_id; });
        hemColorsMaterialIds = _.uniq(hemColorsMaterialIds),

        dropdownOptions = [];

        for (var i = 0; i<hemColorsMaterialIds.length;i++){
            dropdownOptions.push(materials[hemColorsMaterialIds[i]]);
        }

        $scope.solidWoodMaterialCoatings  = solidWoodMaterialCoatings;
        $scope.mdfWithVeenerMaterialCoatings = $.extend(true, [], solidWoodMaterialCoatings); //since no data for mdf veener available
        $scope.hemColorsMaterialCoatings = hemColorsMaterialCoatings;
        $scope.dropdownOptions = dropdownOptions;

        $scope.myModel = {
            selectedDropdownItem: dropdownOptions[0],
            randomPrice :10
        };

        $scope.selectedTile = $scope.solidWoodMaterialCoatings[1];

        $scope.$watch('myModel.selectedDropdownItem',function(){
            $scope.hemColorsMaterialCoatings = _.filter(hemColorsMaterialCoatings, function(item){ 
                return item.material_id == $scope.myModel.selectedDropdownItem.id; });
        },true);

        $scope.selectTile = function(item){

            if(item.identifier == "hem_selected_color"){
                var previousPiv = $scope.selectedTile.piv;
                $scope.selectedTile = item;
                $scope.selectedTile.piv = previousPiv // this is done becuase color material_coatings dont have image of their own, we want to persisit the img size.
            }
            else{
                $scope.selectedTile = item;
            }

            $scope.myModel.randomPrice = Math.floor((Math.random() * 10) + 1); // generate a random price.
        };

        $scope.isSelected = function(item){
            return $scope.selectedTile == item;
        };

        $scope.getCoatingColor = function(item){
            return coatings[item.coating_id].coating_identifier;            
        }

        $scope.getSelectedItemDescription = function(){
            return $scope.selectedTile.material_description.en.replace(/<[^>]*>/g, ' ');
        }

        $scope.isSelectedTileOfColorType =  function(){
             return $scope.selectedTile.identifier == "hem_selected_color";   
        }

    }

}(angular.module('myapp')));