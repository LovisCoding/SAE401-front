class VerifLogin {
	constructor() {
		this.token = localStorage.getItem('token');
		if (this.token == null || this.token == undefined ) {
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
				if (!jsData.token ) {
					window.location.href = 'http://localhost:8080/login';
				}
				// Si il y a un token qui est retourné c'est QUE le token est valide
					

			},
			headers: {
				'Authorization': this.token	
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