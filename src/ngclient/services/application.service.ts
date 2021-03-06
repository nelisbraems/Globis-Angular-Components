import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import {ServoyService} from '../servoy.service';

import {WindowRefService} from '../../sablo/util/windowref.service';

import {SabloService} from '../../sablo/sablo.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DefaultLoginWindowComponent } from './default-login-window/default-login-window.component';
import { FileUploadWindowComponent } from './file-upload-window/file-upload-window.component';
import { LocalStorageService } from '../../sablo/webstorage/localstorage.service';
import { LocaleService } from '../locale.service';
import { ServerDataService } from './serverdata.service';
import { SvyUtilsService } from './utils.service';

@Injectable()
export class ApplicationService {
    private userProperties: {[property: string]: any};

    constructor(private servoyService: ServoyService,
                            private localStorageService: LocalStorageService,
                            private localeService: LocaleService,
                            private windowRefService: WindowRefService,
                            private sabloService: SabloService,
                            @Inject(DOCUMENT) private doc: Document,
                            private modalService: NgbModal,
                            private serverData: ServerDataService,
                             private utilsService: SvyUtilsService) {
    }

    public setLocale(language: string, country: string ) {
        this.localeService.setLocale(language, country);
    }

    public setStyleSheets(paths: string[]) {
       if (paths) {
           for (const path of paths) {
               const link: HTMLLinkElement = this.doc.createElement('link');
               link.setAttribute('rel', 'stylesheet');
               this.doc.head.appendChild(link);
               link.setAttribute('href', path);
           }
       }
    }

    public getUserProperty(key: string) {
        return this.getUserProperties()[key];
    }

    public setUserProperty(key: string, value: any) {
        const userProps = this.getUserProperties();
        if (value == null) delete userProps[key];
        else userProps[key] = value;
        this.localStorageService.set('userProperties', JSON.stringify(userProps));
    }

    public getUIProperty(key: string) {
        return this.servoyService.getUIProperties().getUIProperty(key);
    }

    public setUIProperty(key: string, value: any) {
        this.servoyService.getUIProperties().setUIProperty(key, value);
        if (key === ClientPropertyConstants.WINDOW_BRANDING_ICON_32) {
            this.setIcon(value, '32x32');
        } else if (key === ClientPropertyConstants.WINDOW_BRANDING_ICON_192) {
            this.setIcon(value, '192x192');
        }
    }

    public getUserPropertyNames() {
        return Object.getOwnPropertyNames(this.getUserProperties());
    }

    public showMessage(message: string) {
        this.windowRefService.nativeWindow.alert(message);
    }

    public showUrl(pUrl: string, target: string, targetOptions: string, timeout: number) {
        let url = pUrl;
        // for now, if url starts with 'solutions' we replace it with 'solution'
        // in order for the security.logout to work, using the same server side code, on both ng1 and ng2
        if (url && url.startsWith('solutions')) {
            url = 'solution' + url.substring('solutions'.length);
        }
        if (!target) target = '_blank';
        if (!timeout) timeout = 0;
        setTimeout(() => {
            if (url.indexOf('resources/dynamic') === 0 && target === '_self') {
                let ifrm = this.doc.getElementById('srv_downloadframe');
                if (ifrm) {
                    ifrm.setAttribute('src', url);
                } else {
                    ifrm = this.doc.createElement('IFRAME');
                    ifrm.setAttribute('src', url);
                    ifrm.setAttribute('id', 'srv_downloadframe');
                    ifrm.setAttribute('name', 'srv_downloadframe');
                    ifrm.style.width = 0 + 'px';
                    ifrm.style.height = 0 + 'px';
                    this.doc.body.appendChild(ifrm);
                }
            } else {
                this.windowRefService.nativeWindow.open(url, target, targetOptions);
            }
        }, timeout * 1000);
    }

    public setStatusText(text: string) {
        this.windowRefService.nativeWindow.status = text;
    }

    public getScreenSize() {
        if (this.windowRefService.nativeWindow.screen) {
            return{width: this.windowRefService.nativeWindow.screen.width, height: this.windowRefService.nativeWindow.screen.height, orientation: this.windowRefService.nativeWindow.orientation};
        }
        return null;
    }

    public getUserAgentAndPlatform() {
        return {userAgent: this.windowRefService.nativeWindow.navigator.userAgent, platform: this.windowRefService.nativeWindow.navigator.platform};
    }

    public getClientBrowserInformation() {
        const locale = this.sabloService.getLocale();
        const userAgent = this.getUserAgentAndPlatform();
        return {
            serverURL: this.getServerURL(),
            userAgent : userAgent.userAgent,
            platform : userAgent.platform,
            locale : locale.full,
            remote_ipaddress : this.serverData.getIPAdress(),
            remote_host : this.serverData.getHostAdress(),
            utcOffset : (new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTimezoneOffset() / -60), utcDstOffset: (new Date(new Date().getFullYear(), 6, 1, 0, 0, 0, 0).getTimezoneOffset() / -60)
        };
    }

    public showInfoPanel(url: string, w: number, h: number, t: number, closeText: string) {
        const infoPanel = this.doc.createElement('div');
        infoPanel.innerHTML ='<iframe marginheight=0 marginwidth=0 scrolling=no frameborder=0 src=\''+ url +'\' width=\'100%\' height=\''+ (h - 25) +
                                            '\'></iframe><br><a href=\'#\' id =\'closePanelButton\'>'+ closeText +'</a>';
        infoPanel.style.zIndex ='2147483647';
        infoPanel.id ='infoPanel';
        const width =  this.windowRefService.nativeWindow.innerWidth || this.doc.body.offsetWidth;
        infoPanel.style.position = 'absolute';
        infoPanel.style.left = ((width - w) - 30) + 'px';
        infoPanel.style.top = '10px';
        infoPanel.style.height = h +'px';
        infoPanel.style.width = w +'px';
        this.doc.body.appendChild(infoPanel);
        this.doc.getElementById('closePanelButton').addEventListener('click', (event: MouseEvent) => {
                this.doc.getElementById('infoPanel').style.display='none';
                event.preventDefault();
                event.stopPropagation();
                return false;
        });
        setTimeout(() => this.doc.getElementById('infoPanel').style.display='none', t);
    }

    public showDefaultLogin() {
        if (this.localStorageService.get('servoy_username') && this.localStorageService.get('servoy_password')) {
            const promise = this.sabloService.callService('applicationServerService', 'login',
                    {username : this.localStorageService.get('servoy_username'), password : this.localStorageService.get('servoy_password'), encrypted: true}, false);
            promise.then((ok) => {
                if (!ok) {
                    this.localStorageService.remove('servoy_username');
                    this.localStorageService.remove('servoy_password');
                    this.showDefaultLoginWindow();
                }
            });
        } else {
            this.showDefaultLoginWindow();
        }
    }

    public showFileOpenDialog(title: string, multiselect: boolean, acceptFilter: string, url: string ) {
        if (!url) {
           url = this.utilsService.generateUploadUrl(null, null, null);
        }
        const modalRef = this.modalService.open(FileUploadWindowComponent, { backdrop: 'static' });
        modalRef.componentInstance.url = url;
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.multiselect = multiselect;
        modalRef.componentInstance.filter = acceptFilter;
    }

    public getSolutionName() {
        return this.servoyService.getSolutionSettings().solutionName;
    }

    public trustAsHtml(beanModel: {clientProperty?: {trustDataAsHtml?: boolean}}) {

        if (beanModel && beanModel.clientProperty && beanModel.clientProperty.trustDataAsHtml) {
            return beanModel.clientProperty.trustDataAsHtml;
        }
        return this.servoyService.getUIProperties().getUIProperty('trustDataAsHtml');
    }

    private  showDefaultLoginWindow() {
        this.modalService.open(DefaultLoginWindowComponent, { backdrop: 'static' });
    }

    private   getUserProperties() {
        if (!this.userProperties) {
            const json = this.localStorageService.get('userProperties');
            if (json) {
               this.userProperties = JSON.parse(json);
            } else {
                this.userProperties = {};
            }
        }
        return this.userProperties;
    }

    private  getServerURL() {
        // current remote address including the context (includes leading /)
        const context = this.doc.getElementsByTagName ('base')[0].getAttribute('href');
        return this.windowRefService.nativeWindow.location.protocol + '//' + this.windowRefService.nativeWindow.location.host + context;
    }

    private setIcon(favicon: string, size: string) {
        const link: any = this.doc.querySelector('link[rel*=\'icon\'][sizes=\'' + size + '\']');
        if (link && link.href !== favicon) {
            link.href = favicon;
            this.doc.getElementsByTagName('head')[0].appendChild(link);
        }
    }
}

class ClientPropertyConstants {
    public static WINDOW_BRANDING_ICON_32 = 'window.branding.icon.32';
    public static WINDOW_BRANDING_ICON_192 = 'window.branding.icon.192';
 }
