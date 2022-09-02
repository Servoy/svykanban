angular.module('svykanbanBoard', ['servoy']).directive('svykanbanBoard', function() {
		return {
			restrict: 'E',
			scope: {
				model: '=svyModel',
				handlers: "=svyHandlers",
				api: "=svyApi",
				servoyApi: '=svyServoyapi'
			},
			controller: function($scope, $element, $attrs, $sabloConstants) {
				$scope.render = function(boards) {
					if (!$scope.model.kanban) {
						$scope.model.kanban = new jKanban({
							element: '#kboard_' + $scope.model.svyMarkupId,
							responsivePercentage: $scope.model.responsivePercentage,
							gutter: $scope.model.gutter,
							widthBoard: $scope.model.widthBoard,
							dragItems: $scope.model.dragItems,
							dragBoards: $scope.model.dragBoards,
							itemAddOptions: $scope.model.itemAddOptions || {},
							itemHandleOptions: $scope.model.itemHandleOptions || {},
							buttonClick: function(el, boardId, event) {
								$scope.handlers.buttonClick(el.getAttribute("data-eid"), boardId, event)
							},
							click: function(el, e) {
								$scope.handlers.click(el.getAttribute("data-eid"), e);
							},
							dropEl: function(el, target, source, sibling) {
								$scope.handlers.dropEl(el.getAttribute("data-eid"), target.offsetParent.getAttribute("data-id"), source.offsetParent.getAttribute("data-id"), null);
							}
						});
					}
					$scope.model.kanban.addBoards(boards);
				}

				$scope.api.addBoards = function(boards) {
					//clear exiting boards before adding a new set of boards
					$scope.servoyApi.callServerSideApi("getBoards", []).then(function(b) {
						for (var i = 0; i < b.length; i++) {
							$scope.model.kanban.removeBoard(b[i].id)
						}

					});

					//save new boards
					$scope.servoyApi.callServerSideApi("setBoards", [boards]);

					//render new boards
					$scope.render(boards);
				}

				$scope.api.addElement = function(bid, el, position) {
					if (position === null) {
						position = -1;
					}

					$scope.model.kanban.addElement(bid, el, position);
				}

				$scope.api.updateElement = function(bid, el) {
					var t = $scope.model.kanban.findElement(el.id);
					t.innerHTML = el.title;
					//					t.setAttribute('data-priority', el.priority);
				}

				//if page refreshed, get all the boards again.
				$scope.servoyApi.callServerSideApi("getBoards", []).then(function(b) {
					$scope.render(b);
				});
			},
			templateUrl: 'svykanban/board/board.html'
		};
	})