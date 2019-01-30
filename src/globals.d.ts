export {}

declare global {
	interface Next {
		(): Promise<any>;
	}
}
