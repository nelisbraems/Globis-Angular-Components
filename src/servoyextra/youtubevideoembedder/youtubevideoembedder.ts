import { Component, SimpleChanges, Input, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ServoyBaseComponent } from '../../ngclient/servoy_public';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'servoyextra-youtubevideoembedder',
    templateUrl: './youtubevideoembedder.html'
})
export class ServoyExtraYoutubeVideoEmbedder extends ServoyBaseComponent<HTMLIFrameElement> {

    @Input() enabled: boolean;
    @Input() styleClass: string;
    @Input() tabSeq: number;
    @Input() videoWidth: number;
    @Input() videoHeight: number;
    @Input() allowFullScreen: boolean;
    @Input() autoPlay: boolean;
    @Input() showControls: boolean;
    @Input() modestBranding: boolean;
    @Input() showRelatedVideosAtEnd: boolean;

    @Input() embeddedVideoURL: string;
    @Input() dataProviderID: string;

    public fullYoutubeURL: SafeResourceUrl;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(renderer, cdRef);
    }

    svyOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const property of Object.keys(changes)) {
                const change = changes[property];
                switch (property) {
                    case "embeddedVideoURL":
                    case "dataProviderID":
                    case "allowFullScreen":
                    case "autoPlay":
                    case "showControls":
                    case "modestBranding":
                    case "showRelatedVideosAtEnd":
                        this.updateYoutubeURL();
                        break;
                    case 'styleClass':
                        if (change.previousValue)
                            this.renderer.removeClass(this.getNativeElement(), change.previousValue);
                        if (change.currentValue)
                            this.renderer.addClass(this.getNativeElement(), change.currentValue);
                        break;
                }
            }
        }
        super.svyOnChanges(changes);
    }

    private updateYoutubeURL() {
        let urlWithParams = this.dataProviderID || this.embeddedVideoURL;
        let params = "";

        // in these if's we rely on YouTube defaults as well; we only set them when non-default
        if (!this.allowFullScreen) params += "&fs=0";
        if (!this.showControls) params += "&controls=0";
        if (this.modestBranding) params += "&modestbranding=1";
        if (this.autoPlay) params += "&autoplay=1";
        if (!this.showRelatedVideosAtEnd) params += "&rel=0";

        if (params.length > 0) urlWithParams += "?" + params.substr(1);
        this.fullYoutubeURL = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithParams);
    }

}
