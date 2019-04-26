export class K8sCreateError extends Error {
  constructor(message, failedObject) {
    super(message);
    this.failedObject = failedObject;
  }
}

export class K8sPatchError extends Error {
  constructor(message, failedObject, failedPatches) {
    super(message);
    this.failedObject = failedObject;
    this.failedPatches = failedPatches;
  }
}

export class K8sKillError extends Error {
  constructor(message, json, failedObject) {
    super(message);
    this.json = json;
    this.failedObject = failedObject;
  }
}

export class K8sMultipleErrors extends Error {
  constructor(message, errors) {
    super(message);
    this.errors = errors;
  }
}
