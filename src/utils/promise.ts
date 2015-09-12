/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

export function promiseMap<A, B>(promise: Promise<A>, callback: (x: A) => B): Promise<B> {
	return new Promise<B>((resolve, reject) => {
		promise.then(
			(value) => {
				resolve(callback(value));
			},
			reject
		);
	});
}


export function getResolvedPromises<T>(promises: Promise<T>[], rejectEmpty: boolean) {
	return new Promise<T[]>((resolve, reject) => {
		var resolved: T[] = [];
		
		var completed = 0;
		var total = promises.length;
		function checkComplete() {
			completed++;
			if (completed == total) {
				if (resolved.length || !rejectEmpty) {
					resolve(resolved);
				} else {
					reject();
				}
			}
		}
		
		promises.map((promise) => {
			promise.then((value) => {
				resolved.push(value);
				checkComplete();
			}, checkComplete)
		})
	})
}

export function positiveRace<T>(promises: Promise<T>[]) {
	return new Promise<T>((resolve, reject) => {
		
		var resolved: T[] = [];
		
		var completed = 0;
		var total = promises.length;
		var isCompleted = false;
		
		function checkComplete() {
			completed++;
			if (completed == total && !isCompleted) {
				reject();
			}
		}
		function complete(value: T) {
			if (!isCompleted) {
				resolve(value);
				isCompleted = true;
			}
			checkComplete();
		}
		
		promises.map((promise) => {
			promise.then(complete, checkComplete)
		})
	})
}

export function reject<T>(error: any = null): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		reject(error);
	});
}