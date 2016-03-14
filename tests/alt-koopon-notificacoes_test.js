'use strict';

describe('Service: NotificacoesModule', function () {
    var _rootScope, _scope, _q, _interval, _location, _httpBackend, _xtorage, AltKooponNotificacoesService, AltKooponNotificacoesManager,
        ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS;
    var NOME_CONTROLLER  = 'AltKooponNotificacoesController as aknCtrl';
    var URL_BASE = '/api/123/rest/';
    var URL_COMPLETA = '/api/123/rest/mensagens/count';
    var TEMPO_BUSCA = 5 * 1000 * 60;

    beforeEach(module('alt.koopon.notificacoes', function($provide, AltKooponNotificacoesServiceProvider) {
        AltKooponNotificacoesServiceProvider.BASE_API = URL_BASE;
    }));

    beforeEach(inject(function($injector) {
        _rootScope = $injector.get('$rootScope');
        _scope = _rootScope.$new();
        _q = $injector.get('$q');
        _interval = $injector.get('$interval');
        _httpBackend = $injector.get('$httpBackend');
        _xtorage = $injector.get('$xtorage');
        _location = $injector.get('$location')

        AltKooponNotificacoesService = $injector.get('AltKooponNotificacoesService');
        AltKooponNotificacoesManager = $injector.get('AltKooponNotificacoesManager');

        ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS = $injector.get('ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS');

        spyOn(_xtorage, 'save').and.callFake(angular.noop);
        spyOn(_xtorage, 'remove').and.callFake(angular.noop);
    }));

    describe('constantes', function() {
      it('deve ter o valor correto para ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS', function() {
        expect(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS).toBe('alt_koopon_notificacoes_msg');
      });
    });

    describe('service', function() {
      describe('AltKooponNotificacoesManager', function() {
        describe('criação', function() {
          it('deve retornar um objeto', function() {
            expect(typeof AltKooponNotificacoesManager).toBe('object');
          });
        });

        describe('retorna', function() {
          it('deve chamar o service com o método e parâmetros corretos', function() {
            spyOn(_xtorage, 'get').and.callFake(angular.noop);

            AltKooponNotificacoesManager.retorna();

            expect(_xtorage.get).toHaveBeenCalledWith(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS);
          });
        })

        describe('atualiza', function() {
          it('deve chamar o método com os parâmetros corretos', function() {
            var valorStorageInicial = {a: 1, b: 2, c: 3};
            var valorStorageModificado = {a: 999, b: 2, c: 3};

            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(valorStorageInicial);

            AltKooponNotificacoesManager.atualiza('a', 999);

            expect(_xtorage.save).toHaveBeenCalledWith(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS, valorStorageModificado);
          });
        });

        describe('cria', function() {
          it('deve chamar o método com os parâmetros corretos', function() {
            AltKooponNotificacoesManager.cria({a: 1});

            expect(_xtorage.save).toHaveBeenCalledWith(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS, {a: 1});
          });
        });

        describe('limpa', function() {
          it('deve chamar o service com o método e parâmetros corretos', function() {
            AltKooponNotificacoesManager.limpa();

            expect(_xtorage.remove).toHaveBeenCalledWith(ALT_KOOPON_CHAVE_NOTIFICACOES_MENSAGENS);
          });
        })

        describe('temMensagemPraLer', function() {
          it('deve retornar false - nada na storage', function() {
            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(undefined);

            expect(AltKooponNotificacoesManager.temMensagemPraLer()).toBe(false);
          });

          it('deve retornar false - mesma quantidade de mensagens', function() {
            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({qtd: 1, qtdUltimaReq: 1});

            expect(AltKooponNotificacoesManager.temMensagemPraLer()).toBe(false);
          });

          it('deve retornar false - tem mensagem pra ler, mas limpa está setado como true', function() {
            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({qtd: 1, qtdUltimaReq: 1, limpa: true});

            expect(AltKooponNotificacoesManager.temMensagemPraLer()).toBe(false);
          });

          it('deve retornar true - tem mensagens pra ler', function() {
            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({qtd: 1, qtdUltimaReq: 2});

            expect(AltKooponNotificacoesManager.temMensagemPraLer()).toBe(true);
          });

          it('deve retornar true - tem mensagens pra ler', function() {
            spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({qtd: 0, qtdUltimaReq: 2, limpa: false});

            expect(AltKooponNotificacoesManager.temMensagemPraLer()).toBe(true);
          });
        });
      });

      describe('AltKooponNotificacoesService', function() {
        describe('criação', function() {
          it('deve ter o service como objeto', function () {
            expect(typeof AltKooponNotificacoesService).toBe('object');
          });

          it('deve ter o valor correto para a constante', function () {
            expect(AltKooponNotificacoesService.TEMPO_BUSCA).toBe(TEMPO_BUSCA);
          });
        });

        describe('buscar', function() {
          it('deve tentar buscar a quantidade de mensagem, mas servidor retorna erro', function() {
            _httpBackend.expectGET(URL_COMPLETA).respond(400, {erro: 1});

            AltKooponNotificacoesService
            .buscar()
            .then(function() {
              expect(true).toBeFalsy();
            })
            .catch(function(erro) {
              expect(erro).toEqual({erro: 1});
            });

            _httpBackend.flush();
          });

          it('deve tentar buscar a quantidade de mensagem, mas servidor retorna erro', function() {
            _httpBackend.expectGET(URL_COMPLETA).respond(200, {qtd: 0});

            AltKooponNotificacoesService
            .buscar()
            .then(function(info) {
              expect(info).toEqual({qtd: 0});
            });

            _httpBackend.flush();
          });
        });
      });
    });

    describe('controller', function() {
        describe('criação', function() {
            it('deve ter a controller criada corretamente', inject(function ($controller) {
                $controller(NOME_CONTROLLER, {$scope: _scope});
            }));

            it('deve ter a qtdNotificacoes como zero', inject(function($controller) {
                $controller(NOME_CONTROLLER, {$scope: _scope});

                expect(_scope.aknCtrl.qtdNotificacoes).toBe(0);
            }));

            it('deve ter a exibeNotificacao como false', inject(function($controller) {
                $controller(NOME_CONTROLLER, {$scope: _scope});

                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
            }));
        });

        describe('onLoad', function() {
            it('deve chamar a busca - mesmo que o tempo ainda não tenha passado', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.reject({erro: true});
                });

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA - 1);

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
            }))

            it('deve registrar o evento de $locationChangeSuccess', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                spyOn(_rootScope, '$on').and.callThrough();

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _rootScope.$digest();

                _rootScope.$broadcast('$locationChangeSuccess');

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();

                _rootScope.$digest();

                expect(_scope.aknCtrl.qtdNotificacoes).toBe(999);
            }))

            it('deve chamar a busca corretamente, tempo passou - interval', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.reject({erro: true});
                });

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
            }))

            it('deve chamar preencher as notificacoes com o retorno do service', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(999);
            }))

            it('não deve criar o objeto de notificações na storage - quantidade é zero', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 0});
                });

                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'cria').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'atualiza').and.returnValue(undefined);

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(0);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
                expect(AltKooponNotificacoesManager.cria).toHaveBeenCalledWith({qtd: 0, qtdUltimaReq: 0, limpa: true});
                expect(AltKooponNotificacoesManager.atualiza).not.toHaveBeenCalled();
            }))

            it('deve criar o objeto de notificações na storage - nada existia lá', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 1});
                });

                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'atualiza').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'cria').and.returnValue(undefined);

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(1);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(true);
                expect(AltKooponNotificacoesManager.cria).toHaveBeenCalledWith({qtd: 1, qtdUltimaReq: 0, limpa: false});
                expect(AltKooponNotificacoesManager.atualiza).not.toHaveBeenCalled();
            }))

            it('deve atualizar o objeto de notificações na storage - mas não tem mensagens pra ler', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 1});
                });

                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({});
                spyOn(AltKooponNotificacoesManager, 'atualiza').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'cria').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'temMensagemPraLer').and.returnValue(false);

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(1);
                expect(AltKooponNotificacoesManager.cria).not.toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 1);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
            }))

            it('deve atualizar o objeto de notificações na storage - e tem mensagens pra ler', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 1});
                });

                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({});
                spyOn(AltKooponNotificacoesManager, 'atualiza').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'cria').and.returnValue(undefined);
                spyOn(AltKooponNotificacoesManager, 'temMensagemPraLer').and.returnValue(true);

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(1);
                expect(AltKooponNotificacoesManager.cria).not.toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 1);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(true);
            }))

            it('não deve chamar preencher as notificacoes com o retorno do service - location é /mensagens e não tem nada na storage', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                spyOn(AltKooponNotificacoesManager, 'atualiza').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'cria').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(undefined);

                spyOn(_location, 'path').and.returnValue('/mensagens');

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(999);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.cria).toHaveBeenCalledWith({qtd: 0, qtdUltimaReq: 0, limpa: true});
            }))

            it('não deve chamar preencher as notificacoes com o retorno do service - location é /selecao-empresas e não tem nada na storage', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                spyOn(AltKooponNotificacoesManager, 'atualiza').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'cria').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue(undefined);

                spyOn(_location, 'path').and.returnValue('/selecao-empresas');

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(999);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.cria).toHaveBeenCalledWith({qtd: 0, qtdUltimaReq: 0, limpa: true});
            }))

            it('não deve chamar preencher as notificacoes com o retorno do service - location é /mensagens - só deve atualizar', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                spyOn(AltKooponNotificacoesManager, 'atualiza').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'cria').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({});

                spyOn(_location, 'path').and.returnValue('/mensagens');

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(999);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.cria).not.toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('limpa', true);
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtd', 999);
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 999);
            }))

            it('não deve chamar preencher as notificacoes com o retorno do service - location é /selecao-empresas - só deve atualizar', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.when({qtd: 999});
                });

                spyOn(AltKooponNotificacoesManager, 'atualiza').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'cria').and.callFake(angular.noop);
                spyOn(AltKooponNotificacoesManager, 'retorna').and.returnValue({});

                spyOn(_location, 'path').and.returnValue('/selecao-empresas');

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA + 1);
                _rootScope.$digest();

                expect(_scope.aknCtrl.qtdNotificacoes).toEqual(999);
                expect(_scope.aknCtrl.exibeNotificacao).toBe(false);
                expect(AltKooponNotificacoesService.buscar).toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.cria).not.toHaveBeenCalled();
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('limpa', true);
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtd', 999);
                expect(AltKooponNotificacoesManager.atualiza).toHaveBeenCalledWith('qtdUltimaReq', 999);
            }))
        })
    });
});
