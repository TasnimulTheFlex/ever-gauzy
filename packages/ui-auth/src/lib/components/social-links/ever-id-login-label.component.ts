import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Stands in for the wordmark in the translated label; never shown. */
const WORDMARK_MARK = '\u2063EVER_ID\u2063';

/** The label around the wordmark, e.g. `Login with` before it, or `Mit` before and `anmelden` after it. */
export interface IEverIdLoginLabelParts {
	before: string;
	after: string;
	/** The whole label as text, for screen readers: "Login with Ever ID", "Mit Ever ID anmelden". */
	label: string;
}

/**
 * Splits the translated `LOGIN_PAGE.LOGIN_WITH_EVER_ID` ("Login with {{ everId }}") at the wordmark, so every
 * language keeps its word order. A message without the placeholder (a missing translation) reads "Login with".
 *
 * @param text - The message, translated with the wordmark mark as `everId`.
 * @returns The words before and after the wordmark.
 */
export function everIdLoginLabelParts(text: string): IEverIdLoginLabelParts {
	const at = typeof text === 'string' ? text.indexOf(WORDMARK_MARK) : -1;
	if (at < 0) {
		return { before: 'Login with', after: '', label: 'Login with Base360 ID' };
	}
	const before = text.slice(0, at).trim();
	const after = text.slice(at + WORDMARK_MARK.length).trim();
	return { before, after, label: [before, 'Base360 ID', after].filter(Boolean).join(' ') };
}

@Component({
	selector: 'ngx-ever-id-login-label',
	standalone: true,
	imports: [AsyncPipe],
	templateUrl: './ever-id-login-label.component.html',
	styleUrls: ['./ever-id-login-label.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EverIdLoginLabelComponent {
	private readonly _translate = inject(TranslateService);

	protected readonly parts$: Observable<IEverIdLoginLabelParts> = this._translate
		.stream('LOGIN_PAGE.LOGIN_WITH_EVER_ID', { everId: WORDMARK_MARK })
		.pipe(map((text: string) => everIdLoginLabelParts(text)));
}
