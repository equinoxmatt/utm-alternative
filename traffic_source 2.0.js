<script>
(function(sourceCookieName, campaignCookieName, domain){
	/* Getting started:
	 * Change the site_hostname from "subdomain.domain.com" to your own website
	 * Change .YOUR-DOMAIN-HERE.com" at the bottom of the script.
	 * Other settings are optional - you are good to go!
	 */
	var traffic_source_COOKIE_TOKEN_SEPARATOR = ">>"; //separating between traffic source values.
	var site_hostname = "subdomain.domain.com"; //enter here your site. This will stop the script from populating with internal navigation

	/**
	 * Checks if the referrer is a real referrer and not navigation through the same (sub)domain
	 * @return boolean
	 */
	function isRealReferrer() {
		return document.referrer.split( '/' )[2] != site_hostname;
	}

	/**
	 * Receives a query string parameter name.
	 * @return value of given query string parameter (if true); null if query string parameter is not present.
	 */
	function getURLParameter(param) {
		var pageURL = window.location.search.substring(1); //get the query string parameters without the "?"
		var URLVariables = pageURL.split('&'); //break the parameters and values attached together to an array
		for (var i = 0; i < URLVariables.length; i++) {
			var parameterName = URLVariables[i].split('='); //break the parameters from the values
			if (parameterName[0] == param) {
				return parameterName[1];
			}
		}
		return null;
	}

	/**
	 * Receives a cookie name.
	 * @return Value of given cookie name
	 */
	function getCookie(cookieName) {
		var name = cookieName + "=";
		var cookieArray = document.cookie.split(';'); //break cookie into array
		for(var i = 0; i < cookieArray.length; i++) {
			var cookie = cookieArray[i].replace(/^\s+|\s+$/g, ''); //replace all space with '' = delete it
			if (cookie.indexOf(name)==0){
				return cookie.substring(name.length,cookie.length); //
			}
		}
		return null;
	}


	/**
	 * Checks if a string is empty.
	 * @return false if empty or null.
	 */
	function isNotNullOrEmpty(string) {
		return string !== null && string !== "";
	}

	/**
	 * Sets a new cookie. Receives cookie name and value.
	 */
	function setCookie(cookie, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + 62208000000); //1000*60*60*24*30*24 (2 years)
		document.cookie = cookie + "=" + value + "; expires=" + expires.toGMTString() + "; domain=" + domain + "; path=/";
	}

	/**
	 * removes referrer's protocol for cleaner data
	 * @return referrer without http:// | https://
	 */
	function removeProtocol(href) {
		return href.replace(/.*?:\/\//g, "");
	}



	if (isRealReferrer()) { //if the last page was not the page of the website/domain...
		//Variables that will be used by both cases - A & B
		//CASE A - a new session, if there is no traffic source cookie created previously.
		//CASE B - returning user with the traffic source cookie already set.

		var traffic_source = ""; //reset traffic source value
		var traffic_campaign = "";
		var urlParamSRC = getURLParameter('utm_source'); //get value of the query string parameter (if any)
		var urlParamCAMPAIGN = getURLParameter('utm_campaign');

		if(document.cookie.indexOf(sourceCookieName) === -1) //CASE A starts
		{
			//First check is there is and old UTMZ cookie if we can use
			var utmzCookie = getCookie("__utmz"); //get ga.js cookie
			if(utmzCookie != null) { //if there is UTMZ cookie
				var utmzCookieCampaignValue = "";
				var UTMSRC = "utmccn=";
				var start = utmzCookie.indexOf(UTMSRC);
				var end = utmzCookie.indexOf("|", start);
				if (start > -1) {
					if(end === -1) {
						end = utmzCookie.length;
					}
				}
				utmzCookieCampaignValue = "utmz:" + utmzCookie.substring((start + UTMSRC.length), end); //get the value of the UTMZ, without the parameter name
				traffic_source = traffic_source_COOKIE_TOKEN_SEPARATOR + utmzCookieCampaignValue;
			}


			if (isNotNullOrEmpty(urlParamSRC)) { //if there is a SRC query string parameter
				traffic_source = urlParamSRC + traffic_source;  //use it, add it to the variable
				//if no SRC, check if there is a REFERRER
			} else if (isNotNullOrEmpty(document.referrer)){

			} else {
				traffic_source = "none or direct" + traffic_source;
			}

			if (isNotNullOrEmpty(urlParamCAMPAIGN)) { //if there is a SRC query string parameter
				traffic_campaign = urlParamSRC + traffic_campaign;  //use it, add it to the variable
				//if no SRC, check if there is a REFERRER
			} else {
				traffic_campaign = "none";
			}

			// CREATE THE COOKIE
			setCookie(sourceCookieName, traffic_source); //set the cookie
			setCookie(campaignCookieName, traffic_campaign);

		} //End of CASE A if there is no traffic source cookie
		else
		{	//CASE B starts - traffic source cookie already exists

			//Get the traffic source value from the URL (if any)
			if (isNotNullOrEmpty(urlParamSRC)) { //if there is a traffic source query string parameter
				traffic_source = urlParamSRC;  //use it, add it to the variable
				//if no traffic source value as a query string parameter, check if there is a REFERRER
			} else if (isNotNullOrEmpty(document.referrer)) {
				traffic_source = removeProtocol(document.referrer); //use it, add it to the variable
			} else {
				traffic_source = "none or direct" + traffic_source;
			}

			//Get the traffic source value from the URL (if any)
			if (isNotNullOrEmpty(urlParamCAMPAIGN)) { //if there is a traffic source query string parameter
				traffic_campaign = urlParamCAMPAIGN;  //use it, add it to the variable
				//if no traffic source value as a query string parameter, check if there is a REFERRER
			} else {
				traffic_campaign = "none";
			}

			//Update the cookie with the new traffic_source of the new user visit
			updated_traffic_source = traffic_source + traffic_source_COOKIE_TOKEN_SEPARATOR + getCookie(sourceCookieName);
			setCookie(sourceCookieName, updated_traffic_source);

			updated_traffic_campaign = traffic_campaign + traffic_source_COOKIE_TOKEN_SEPARATOR + getCookie(campaignCookieName);
			setCookie(campaignCookieName, updated_traffic_campaign);
		}  //end of CASE B
	}
})("traffic_source", "campaign_source", ".YOUR-DOMAIN-HERE.com");
</script>