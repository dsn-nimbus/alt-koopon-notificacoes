;(function(ng) {
  'use strict';

  ng.module('alt.koopon.notificacoes', [])
      .provider('AltKooponNotificacoesService', [function() {
          var self = this;

          self.BASE_API = '/koopon-rest-api/';

          this.$get = ['$http', '$q', function($http, $q) {
              var AltKooponNotificacoes = function() {
                  this.TEMPO_BUSCA = 5 * 1000 * 60; // 5 minutos
                  this.URL = self.BASE_API + 'mensagens/count';
              };

              AltKooponNotificacoes.prototype.buscar = function() {
                  return $http.get(this.URL)
                      .then(function(info) {
                          return info.data;
                      })
                      .catch(function(erro) {
                          return $q.reject(erro.data);
                      });
              };

              return new AltKooponNotificacoes();
          }];
      }])
      .controller('AltKooponNotificacoesController', ['$rootScope', '$interval', 'AltKooponNotificacoesService', function($rootScope, $interval, AltKooponNotificacoesService) {
          var self = this;

          self.qtdNotificacoes = 0;
          self._idInterval = 0;
          self._buscar = function() {
              AltKooponNotificacoesService
                      .buscar()
                      .then(function(info) {
                          self.qtdNotificacoes = info.qtd;
                      });
          };

          ;(function() {
              self._idInterval = $interval(self._buscar, AltKooponNotificacoesService.TEMPO_BUSCA);

              $rootScope.$on('$locationChangeSuccess', function() {
                  self._buscar();

                  $interval.cancel(self._idInterval);

                  self._idInterval = $interval(self._buscar, AltKooponNotificacoesService.TEMPO_BUSCA);
              });
          }());
      }]);
}(angular));
