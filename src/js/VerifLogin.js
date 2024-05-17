class VerifLogin {
	constructor() {
		this.token = localStorage.getItem('token');
		if (this.token == null || this.token == undefined ) {
			console.log(';a');
			window.location.href = 'http://localhost:8080/login';
		}
		this.request();
	}
	request() {
		$.ajax({
			url: 'http://localhost:8000/api/verifyUser',
			type: 'POST',
			dataType: 'text',
			success: function(data){
				console.log(data);
				const jsData = JSON.parse(data);
				if (!jsData.token) {
					console.log('pas de token');
					window.location.href = 'http://localhost:8080/login';
				}
					

			},
			headers: {
				'Authorization': 'Basic ' + this.token	
			},
			xhrFields: {
				withCredentials: true
			  },
			
			error: function(jqXHR, textStatus, errorThrown){
				console.log('Erreur : ' + errorThrown);
			}
		});
	}
	
}
new VerifLogin();