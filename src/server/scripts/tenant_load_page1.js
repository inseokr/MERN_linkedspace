// 1. Location
  let listing = "<%=listing_info.listing%>";

  console.log("ISEO: tenant_load_page1 is called");

  // ISEO: Wow... preprocessor is executing every single line includes <%... bummer....
  $('#street').val("<%=listing_info.listing.Location.street;%>");
  $('#city').val("<%=listing_info.listing.Location.city%>");
  $('#state').val("<%=listing_info.listing.Location.state%>");
  $('#country').val("<%=listing_info.listing.Location.country%>");
  $('#zipcode').val("<%=listing_info.listing.Location.zipcode%>");

  // Distance range allowed
  $('#maximum_range_in_miles').val("<%=listing_info.listing.maximum_range_in_miles%>");

  // Rental Duration
  $('#rental_duration').val("<%=listing_info.listing.rental_duration%>");

  // Maximum budget
  $('#rental_budget').val("<%=listing_info.listing.rental_budget%>");

  // Move-in Date
  $('#month').val("<%=listing_info.listing.move_in_date.month%>");
  $('#date').val("<%=listing_info.listing.move_in_date.date%>");
  $('#year').val("<%=listing_info.listing.move_in_date.year%>");

   console.log("ISEO: tenant_load_page1 is called1");
