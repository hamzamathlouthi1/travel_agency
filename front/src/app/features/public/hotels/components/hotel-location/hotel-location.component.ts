import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HotelLocation } from '../../models/hotel-detail.model';

@Component({
  selector: 'app-hotel-location',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2 class="title">Explore the neighbourhood</h2>
      <div class="map" role="img" [attr.aria-label]="'Map preview of ' + location().area + ', ' + location().destination">
        <span class="road road-one"></span><span class="road road-two"></span><span class="road road-three"></span>
        <span class="water"></span><span class="pin"><i></i></span>
        <span class="map-label">{{ location().area }}</span><span class="map-badge">Excellent location</span>
      </div>
      <p class="note"><strong>{{ location().area }}, {{ location().destination }}</strong>@if (location().distanceNote) { · {{ location().distanceNote }} }</p>
    </section>
  `,
  styles: `
    .title { font-weight: var(--font-weight-extrabold); font-size: var(--font-size-lg); margin: 0 0 var(--space-3); }
    .map { position: relative; overflow: hidden; height: 240px; border-radius: var(--radius-lg); background: #e9e6dc; border: 1px solid var(--color-border); }
    .map::before { content: ''; position: absolute; inset: 0; opacity: .55; background-image: linear-gradient(35deg, transparent 48%, #fff 49% 52%, transparent 53%), linear-gradient(-28deg, transparent 47%, #fff 48% 51%, transparent 52%); background-size: 110px 85px, 145px 100px; }
    .water { position: absolute; right: -40px; top: -50px; width: 38%; height: 150%; background: #b8dadd; transform: rotate(8deg); border-left: 3px solid rgba(255,255,255,.8); }
    .road { position: absolute; display: block; height: 6px; background: #fff; box-shadow: 0 0 0 1px rgba(30,50,60,.06); }
    .road-one { width: 80%; top: 52%; left: -8%; transform: rotate(-10deg); }.road-two { width: 58%; top: 25%; left: 12%; transform: rotate(54deg); }.road-three { width: 48%; bottom: 18%; left: 22%; transform: rotate(27deg); }
    .pin { position: absolute; left: 48%; top: 38%; width: 42px; height: 42px; border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); background: var(--color-ink-950); box-shadow: 0 8px 20px rgba(20,30,40,.25); display: grid; place-items: center; }
    .pin i { width: 13px; height: 13px; border-radius: 50%; background: var(--color-amber-500); }
    .map-label { position: absolute; left: calc(48% - 30px); top: calc(38% + 52px); padding: 5px 10px; border-radius: 5px; background: rgba(255,255,255,.92); font-weight: 800; font-size: 11px; }
    .map-badge { position: absolute; left: 14px; bottom: 14px; padding: 9px 12px; border-radius: 7px; background: rgba(255,255,255,.94); box-shadow: var(--shadow-sm); color: var(--color-success); font-size: 11px; font-weight: 800; }
    .note { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: var(--space-3) 0 0; }.note strong { color: var(--color-text-primary); }
  `,
})
export class HotelLocationComponent { readonly location = input.required<HotelLocation>(); }
