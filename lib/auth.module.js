"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var auth_service_1 = require('./auth.service');
var auth_guard_1 = require('./auth.guard');
var AuthModule = (function () {
    function AuthModule() {
    }
    AuthModule.forRoot = function (configData) {
        return {
            ngModule: AuthModule,
            providers: [
                { provide: auth_service_1.AuthServiceConfig, useValue: configData }
            ]
        };
    };
    AuthModule = __decorate([
        core_1.NgModule({
            imports: [
                http_1.HttpModule,
            ],
            providers: [
                auth_service_1.AuthService,
                auth_guard_1.AuthGuard
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AuthModule);
    return AuthModule;
}());
exports.AuthModule = AuthModule;