import { environment } from '@gauzy/config';

export const DEFAULT_ORGANIZATION_TEAMS = [
	{
		name: 'Employees',
		defaultMembers: [
			`${environment.demoCredentialConfig.superAdminEmail}`,
			`${environment.demoCredentialConfig.adminEmail}`,
			`${environment.demoCredentialConfig.employeeEmail}`,
			'ruslan@example.com',
			'alish@example.com',
			'julia@example.com',
			'booster@example.com',
			'yoster@example.com'
		],
		manager: [`${environment.demoCredentialConfig.superAdminEmail}`, 'ruslan@example.com']
	},
	{
		name: 'Contractors',
		defaultMembers: [
			`${environment.demoCredentialConfig.adminEmail}`,
			'ckhandla94@gmail.com',
			'hoster@example.com',
			'aster@example.com'
		],
		manager: [`${environment.demoCredentialConfig.adminEmail}`, 'ruslan@example.com']
	},
	{
		name: 'Designers',
		defaultMembers: [
			`${environment.demoCredentialConfig.employeeEmail}`,
			'julia@example.com',
			'roster@example.com',
			'dister@example.com',
			'postern@example.com'
		],
		manager: ['julia@example.com', 'alish@example.com', `${environment.demoCredentialConfig.employeeEmail}`]
	},
	{
		name: 'QA',
		defaultMembers: [
			`${environment.demoCredentialConfig.superAdminEmail}`,
			`${environment.demoCredentialConfig.employeeEmail}`,
			'julia@example.com',
			'kyoster@example.com',
			'taster@example.com',
			'mustero@smooper.xyz'
		],
		manager: ['julia@example.com']
	},
	{
		name: 'Developers',
		defaultMembers: [
			`${environment.demoCredentialConfig.adminEmail}`,
			`${environment.demoCredentialConfig.employeeEmail}`,
			'ruslan@example.com',
			'alish@example.com',
			'booster@example.com',
			'yoster@example.com',
			'ckhandla94@gmail.com',
			'rahulrathore576@gmail.com'
		],
		manager: [`${environment.demoCredentialConfig.adminEmail}`, 'ruslan@example.com', 'alish@example.com']
	},
	{
		name: 'Marketing',
		defaultMembers: [
			`${environment.demoCredentialConfig.employeeEmail}`,
			'julia@example.com',
			'yostorono@example.com',
			'desterrro@hotmail.com'
		],
		manager: ['yostorono@example.com', `${environment.demoCredentialConfig.employeeEmail}`]
	},
	{
		name: 'Default Team',
		defaultMembers: [
			`${environment.demoCredentialConfig.superAdminEmail}`,
			`${environment.demoCredentialConfig.employeeEmail}`,
			`${environment.demoCredentialConfig.adminEmail}`,
			'ruslan@example.com',
			'alish@example.com',
			'julia@example.com'
		],
		manager: [
			`${environment.demoCredentialConfig.superAdminEmail}`,
			`${environment.demoCredentialConfig.adminEmail}`,
			`${environment.demoCredentialConfig.employeeEmail}`
		]
	},
	{
		name: 'Backend Team',
		defaultMembers: [
			`${environment.demoCredentialConfig.adminEmail}`,
			'ruslan@example.com',
			'alish@example.com',
			'ckhandla94@gmail.com',
			'rahulrathore576@gmail.com',
			'booster@example.com',
			'hoster@example.com'
		],
		manager: ['ruslan@example.com', `${environment.demoCredentialConfig.adminEmail}`]
	},
	{
		name: 'Frontend Team',
		defaultMembers: [
			`${environment.demoCredentialConfig.employeeEmail}`,
			'alish@example.com',
			'julia@example.com',
			'yoster@example.com',
			'roster@example.com',
			'dister@example.com'
		],
		manager: ['alish@example.com', `${environment.demoCredentialConfig.employeeEmail}`]
	},
	{
		name: 'Mobile Team',
		defaultMembers: [
			`${environment.demoCredentialConfig.employeeEmail}`,
			'ruslan@example.com',
			'booster@example.com',
			'ckhandla94@gmail.com',
			'yoster@example.com',
			'postern@example.com'
		],
		manager: ['ruslan@example.com', `${environment.demoCredentialConfig.employeeEmail}`]
	},
	{
		name: 'DevOps Team',
		defaultMembers: [
			`${environment.demoCredentialConfig.superAdminEmail}`,
			`${environment.demoCredentialConfig.adminEmail}`,
			'ruslan@example.com',
			'ckhandla94@gmail.com',
			'hoster@example.com'
		],
		manager: [`${environment.demoCredentialConfig.superAdminEmail}`, 'ruslan@example.com']
	}
];
