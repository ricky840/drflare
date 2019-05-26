function WebRequest(requestId, onSendHeaders) {
	this.requestId = requestId;
	this.onSendHeaders = onSendHeaders;
	this.onHeaderReceived;
	this.onResponseStarted;
	this.onCompleted;
}