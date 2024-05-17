class VerifLogin {
	constructor() {
		this.token = localStorage.getItem('token');
	}
	request() {
		$.ajax({
			url: 'http://localhost:8000/api/verifyUser',
			type: 'POST',
			dataType: 'text',
			success: function(data){
				const jsData = JSON.parse(data);
				console.log(jsData.token);
				if (!jsData.token) {
					console.log('pas de token');
				}
					

			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + this.token);
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