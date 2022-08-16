function isNode() {
	return typeof process !== "undefined" && process.release && process.release.name === "node";
}

export function getUtil() {
	if (isNode()) {
		return import("./node");
	} else {
		return import("./web");
	}
}
