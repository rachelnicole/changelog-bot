var response = { 
  "name": "Rachel White",
  "email": "loveless@gmail.com",
  "github_handle": "rachelnicole",
  "twitter_handle": "ohhoe"
}


for (var key in response) {
  var value = response[key];
  if (key.includes("_")) {
    key = key.split("_")[0];
  }
  console.log('Their ' + key + ' is: ' + value)

}

