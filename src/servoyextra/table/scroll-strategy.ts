/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';


/** Virtual scrolling strategy for lists with items of known fixed size. */
@Injectable()
export class CustomVirtualScrollStrategy implements VirtualScrollStrategy {
    private _scrolledIndexChange = new Subject<number>();

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());


    /** The attached viewport. */
    private _viewport: CdkVirtualScrollViewport | null = null;

    /** The size of the items in the virtually scrolling list. */
    private _itemSize: number;

    /** The minimum amount of buffer rendered beyond the viewport (in pixels). */
    private _minBufferPx: number;

    /** The number of buffer items to render beyond the edge of the viewport (in pixels). */
    private _maxBufferPx: number;
    private wantedOffset = -1;
    private skipEvent = false;

    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor() {
    }

    /**
     * Attaches this scroll strategy to a viewport.
     *
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport: CdkVirtualScrollViewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }

    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }

    /**
     * Update the item size and buffer size.
     *
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize: number, minBufferPx: number, maxBufferPx: number) {
        if (this._itemSize !== itemSize || this._minBufferPx !== minBufferPx || this._maxBufferPx !== maxBufferPx) {
            this._itemSize = itemSize;
            this._minBufferPx = minBufferPx;
            this._maxBufferPx = maxBufferPx;
            this._updateTotalContentSize();
            this._updateRenderedRange();
        }
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() { /* no-op */ }

    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() { /* no-op */ }

    /**
     * Scroll to the offset for the given index.
     *
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index: number, behavior: ScrollBehavior): void {
        if (this._viewport) {
            this._updateRenderedRange( index * this._itemSize);
            this._viewport.scrollToOffset(this.wantedOffset, behavior);
        }
    }

    /** Update the viewport's total content size. */
    private _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }

        this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    }

    /** Update the viewport's rendered range. */
    private _updateRenderedRange(wantedOffset?: number) {
        if (!this._viewport) {
            return;
        }
        let scrollOffset = this._viewport.measureScrollOffset();
        if (this.wantedOffset !== -1 && Math.round(scrollOffset) !== Math.round(this.wantedOffset) && wantedOffset === undefined) {
              this._viewport.scrollToOffset(this.wantedOffset);
            return;
        }
        if (this.skipEvent) {
            return;
        }

        this.wantedOffset = wantedOffset?wantedOffset:-1;
        scrollOffset = wantedOffset?wantedOffset:scrollOffset;

        const renderedRange = this._viewport.getRenderedRange();
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        // Prevent NaN as result when dividing by zero.
        let firstVisibleIndex = (this._itemSize > 0) ? scrollOffset / this._itemSize : 0;

        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
            const newVisibleIndex = Math.max(0,
                Math.min(firstVisibleIndex, dataLength - maxVisibleItems));

            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex !== newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = newVisibleIndex * this._itemSize;
                newRange.start = Math.floor(firstVisibleIndex);
            }

            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }

        const startBuffer = scrollOffset - newRange.start * this._itemSize;
        if (startBuffer < this._minBufferPx && newRange.start !== 0) {
            const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
            newRange.start = Math.max(0, newRange.start - expandStart);
            newRange.end = Math.min(dataLength,
                Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
        } else {
            const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
            if (endBuffer < this._minBufferPx && newRange.end !== dataLength) {
                const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, newRange.end + expandEnd);
                    newRange.start = Math.max(0,
                        Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
                }
            }
        }

        if (newRange.start !== renderedRange.start || newRange.end !== renderedRange.end) {
            this._viewport.setRenderedRange(newRange);
            this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
            this.skipEvent = true;
            setTimeout( () => {
                this.skipEvent = false;
                if (scrollOffset !== this._viewport.measureScrollOffset()) this._viewport.scrollToOffset(scrollOffset);
                }, 200 );
        }
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}
