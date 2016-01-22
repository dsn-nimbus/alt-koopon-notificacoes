;(function(ng) {
  'use strict';

  ng.module('alt.koopon.notificacoes', ['emd.ng-xtorage'])
      .constant('ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS', 'alt_koopon_notificacoes_msg')
      .service('AltKooponNotificacoesManager', ['$xtorage', 'ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS', function($xtorage, ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS) {
        this.retorna = function() {
          return $xtorage.get(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS);
        }

        this.atualiza = function(prop, valor) {
          var infoStorage = this.retorna();

          infoStorage[prop] = valor;

          $xtorage.save(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS, infoStorage);
        }

        this.cria = function(info) {
          $xtorage.save(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS, info);
        }

        this.limpa = function() {
          $xtorage.remove(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS);
        }

        this.temMensagemPraLer = function() {
          var infoStorage = this.retorna() || {};
          var qtdMsg = infoStorage.qtd;
          var novaQtdMsg = infoStorage.qtdUltimaReq;
          var limpaStorage = infoStorage.limpa;

          return (novaQtdMsg > qtdMsg) && !limpaStorage;
        }
      }])
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
      .controller('AltKooponNotificacoesController', ['$rootScope', '$location', '$interval', 'AltKooponNotificacoesService', 'AltKooponNotificacoesManager', function($rootScope, $location, $interval, AltKooponNotificacoesService, AltKooponNotificacoesManager) {
          var self = this;

          self.exibeNotificacao = false;
          self.qtdNotificacoes = 0;
          self._idInterval = 0;

          self._buscar = function() {
              AltKooponNotificacoesService
                      .buscar()
                      .then(function(info) {
                          if ($location.path() === "/mensagens") {
                            self.exibeNotificacao = false;
                            return AltKooponNotificacoesManager.atualiza('limpa', true);
                          }

                          self.qtdNotificacoes = info.qtd;

                          if (!self.qtdNotificacoes) {
                            self.exibeNotificacao = false;
                            return AltKooponNotificacoesManager.cria({qtd: 0, qtdUltimaReq: 0, limpa: true});
                          }

                          if (!AltKooponNotificacoesManager.retorna()) {
                            self.exibeNotificacao = true;
                            return AltKooponNotificacoesManager.cria({qtd: self.qtdNotificacoes, qtdUltimaReq: 0, limpa: false});
                          }

                          AltKooponNotificacoesManager.atualiza('qtdUltimaReq', self.qtdNotificacoes);

                          if (AltKooponNotificacoesManager.temMensagemPraLer()) {
                            self.exibeNotificacao = true;
                          }
                          else {
                            self.exibeNotificacao = false;
                          }
                      });
          };

          ;(function() {
              self._buscar();

              self._idInterval = $interval(self._buscar, AltKooponNotificacoesService.TEMPO_BUSCA);

              $rootScope.$on('$locationChangeSuccess', function() {
                  self._buscar();

                  $interval.cancel(self._idInterval);

                  self._idInterval = $interval(self._buscar, AltKooponNotificacoesService.TEMPO_BUSCA);
              });
          }());
      }]);
}(angular));
