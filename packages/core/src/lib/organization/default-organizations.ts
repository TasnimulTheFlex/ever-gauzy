import { CurrenciesEnum, DefaultValueDateTypeEnum } from '@gauzy/contracts';

export const DEFAULT_EVER_ORGANIZATIONS = [
	{
		name: 'Base360',
		currency: CurrenciesEnum.BGN,
		defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
		imageUrl: 'assets/images/logos/ever-large.jpg',
		isDefault: true,
		totalEmployees: 17
	},
	{
		name: 'Base360 International',
		currency: CurrenciesEnum.ILS,
		defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
		imageUrl: 'assets/images/logos/ever-large.jpg',
		isDefault: false,
		totalEmployees: 0
	}
];

export const DEFAULT_ORGANIZATIONS = [
	{
		name: 'Base360',
		currency: CurrenciesEnum.USD,
		defaultValueDateType: DefaultValueDateTypeEnum.TODAY,
		imageUrl: 'assets/images/logos/logo_Base360.svg',
		isDefault: true,
		totalEmployees: 1
	}
];
