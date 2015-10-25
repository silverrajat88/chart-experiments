(function (app) {

    app.controller('graphController', ['$scope', '$route','$rootScope', graphController]);

    function graphController($scope, $route, $rootScope) {
	
		$(window).on("resize.opticsRe", function(){
			$rootScope.$apply(); // if window is resized, it will be outside the angular realm, so explicitly calling $apply to call the digest loop.
		});
		
		$scope.$on("$destroy", function () {
            $(window).off("resize.opticsRe");
        });

        $scope.options = {
            "axes": {
                "x": {
                    "key": "x",
                    "type": "linear",
                    "labelFunction": function (i) {
                        return i;
                    }
                },
                "y": {
                    "type": "linear"
                }
            },
            "lineMode": "cardinal",
            "tooltipMode": "default",
            "series": [
                {
                    "axis": "y",
                    "y": "A",
                    "label": "",
                    "color": "#67940A",
                    "striped": false,
                    "thickness": "1px",
                    "type": "column"
                },
                {
                    "axis": "y",
                    "y": "B",
                    "label": "",
                    "color": "#3C284E",
                    "striped": false,
                    "thickness": "1px",
                    "type": "column"
                },
                {
                    "axis": "y2",
                    "y": "C",
                    "label": "",
                    "color": "#4169E1",
                    "striped": false,
                    "thickness": "1px",
                    "type": "line"
                }
                //{
                //    "axis": "y",
                //    "y": "y_VAR_ROLLUP_ALLSHUNTS_FROMBATTERY_0",
                //    "label": "",
                //    "color": "#87CEEB",
                //    "striped": false,
                //    "thickness": "1px",
                //    "type": "column"
                //}
            ]
        }


        $scope.realData3 = [
           {
               x: 0,
               A: 100,
               B: 93,
               C: {
                   open: 25,
                   close: 30,
                   high: 33,
                   low: 22
               }
           },
           {
               x: 1,
               A: 20,
               B: 70,
               C: {
                   open: 50,
                   close: 70,
                   high: 71,
                   low: 48
               }
           },
            {
                x: 2,
                A: 20,
                B: 70,
                C: {
                    open: 60,
                    close: 50,
                    high: 63,
                    low: 50
                }
            },
            {
                x: 3,
                A: 20,
                B: 70,
                C: {
                    open: 10,
                    close: 15,
                    high: 16,
                    low: 9
                }
            },
            {
                x: 4,
                A: 20,
                B: 70,
                C: {
                    open: 23,
                    close: 23,
                    high: 23,
                    low: 23
                }
            },
            {
                x: 5,
                A: 20,
                B: 70,
                C: {
                    open: 29,
                    close: 30,
                    high: 30,
                    low: 29
                }
            }

        ];

        $scope.realData2 = [
            {
                x: 0,
                A: 100,
                B: 93,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 1,
                A: 35,
                B: 70,
                C: 33,
                D: 33,
                E: 22,
                F: 33
            },
            {
                x: 2,
                A: 0,
                B: 11,
                C: 7,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 3,
                A: 33,
                B: 77,
                C: 55,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 4,
                A: 69,
                B: 96,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 5,
                A: 20,
                B: 50,
                C: 80,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 6,
                A: 27,
                B: 15,
                C: 85,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 7,
                A: 100,
                B: 93,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 8,
                A: 20,
                B: 70,
                C: 33,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 9,
                A: 0,
                B: 11,
                C: 7,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 10,
                A: 33,
                B: 77,
                C: 55,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 11,
                A: 69,
                B: 96,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 12,
                A: 20,
                B: 50,
                C: 80,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 13,
                A: 27,
                B: 15,
                C: 85,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 14,
                A: 100,
                B: 93,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 15,
                A: 20,
                B: 70,
                C: 33,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 16,
                A: 0,
                B: 11,
                C: 7,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 17,
                A: 33,
                B: 77,
                C: 55,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 18,
                A: 69,
                B: 96,
                C: 42,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 19,
                A: 20,
                B: 50,
                C: 80,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 20,
                A: 27,
                B: 15,
                C: 85,
                D: 33,
                E: 11,
                F: 55
            },
              {
                  x: 21,
                  A: 100,
                  B: 93,
                  C: 42,
                  D: 33,
                  E: 11,
                  F: 55
              },
            {
                x: 22,
                A: 20,
                B: 70,
                C: 33,
                D: 33,
                E: 11,
                F: 55
            },
            {
                x: 23,
                A: 0,
                B: 11,
                C: 7,
                D: 33,
                E: 11,
                F: 55
            }
        ];

    }

}(angular.module('myapp')));