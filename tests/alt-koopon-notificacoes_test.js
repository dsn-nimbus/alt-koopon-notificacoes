'use strict';

describe('Service: NotificacoesModule', function () {
    var _rootScope, _scope, _q, _interval, _httpBackend, AltKooponNotificacoesService;
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

        AltKooponNotificacoesService = $injector.get('AltKooponNotificacoesService');
    }));

    describe('service', function() {
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

    describe('controller', function() {
        describe('criação', function() {
            it('deve ter a controller criada corretamente', inject(function ($controller) {
                $controller(NOME_CONTROLLER, {$scope: _scope});
            }));

            it('deve ter a qtdNotificacoes como zero', inject(function($controller) {
                $controller(NOME_CONTROLLER, {$scope: _scope});

                expect(_scope.aknCtrl.qtdNotificacoes).toBe(0);
            }));
        });

        describe('onLoad', function() {
            it('não deve chamar a busca - tempo ainda não passou - interval', inject(function($controller) {
                spyOn(AltKooponNotificacoesService, 'buscar').and.callFake(function() {
                    return _q.reject({erro: true});
                });

                $controller(NOME_CONTROLLER, {$scope: _scope});

                _interval.flush(TEMPO_BUSCA - 1);

                expect(AltKooponNotificacoesService.buscar).not.toHaveBeenCalled();
            }))

            it('deve chamar a busca corretamente - interval', inject(function($controller) {
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
        })
    });
});
