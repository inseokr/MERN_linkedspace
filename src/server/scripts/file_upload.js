
// We'd better set it up before hand
$("#avatar-upload").css('max-width', '500px');
$("#avatar-preview").css('width', '490px');
$("#avatar-preview").css('height', '250px');
$("#previewLabel").css('left', '80px');
$("#previewLabel").css('bottom', '90px');
$("#previewLabel").text('Click to upload');
$("#previewLabel").css('font-size', '3em');

function handleOnClickDeletePic(elementId, url_prefix, _id)
{
	console.log("handleOnClickDeletePic is called");
	// Upload the file along with caption
	var myFormData = new FormData();

	// ISEO: may need to add listing ID as well.
	$.ajax({
	  enctype: 'multipart/form-data',
	  url:  `${url_prefix}/${_id}/file_delete`,
	  type: 'POST',
	  processData: false, // important
	  contentType: false, // important
	  dataType : 'application/json',
	  data: myFormData
	});

    $("#imagePreview").css('background-image', 'url("")');
    $("#previewLabel").css('opacity', 1);
    $("#deleteLabel").css('opacity', 0)
}

function handleOnMouseHooverImagePreview(elementId) {
    var previewLabelId = document.getElementById("previewLabel");
    
    if(previewLabelId.style.opacity==0)
    {
        var avatarDeleteId = document.getElementById("avatar-delete");
        avatarDeleteId.style.display = "inline-block";
    }

    if(previewLabelId.style.opacity==0) {
        var labelElementId = document.getElementById("editLabel");
        labelElementId.style.opacity = 1;


        labelElementId = document.getElementById("deleteLabel");
        labelElementId.style.opacity = 1;
    }
}

function handleOnMouseOutImagePreview(elementId) {
    var previewLabelId = document.getElementById("previewLabel");

    if(previewLabelId.style.opacity==0) {
        var labelElementId = document.getElementById("editLabel");
        labelElementId.style.opacity = 0;

        var labelElementId = document.getElementById("deleteLabel");
        labelElementId.style.opacity = 0;
    }

}


function readURL(input, url_prefix, _id) {

	console.log("readURL is called. url_prefix="+url_prefix);
	
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $("#imagePreview").css('background-image', 'url('+e.target.result +')');
            $("#imagePreview").css('background-position', '0% 10%');
            $("#imagePreview").css('background-size', '100%');

            $("#imagePreview").hide();
            $("#imagePreview").fadeIn(650);
        }

        reader.readAsDataURL(input.files[0]);

	    $("#previewLabel").css('opacity', 0);

	    var picturePreviewId = document.getElementById("avatar-upload");
		picturePreviewId.style.display = "inline-block";

        // Upload the file along with caption
		var myFormData = new FormData();
		myFormData.append("file_name", input.files[0]);
        myFormData.append("caption", $("#imageCapture").val());

		// ISEO: may need to add listing ID as well.
		$.ajax({
		  enctype: 'multipart/form-data',
		  url: `${url_prefix}/${_id}/file_upload`,
		  type: 'POST',
		  processData: false, // important
		  contentType: false, // important
		  dataType : 'application/json',
		  data: myFormData
		});
    } 
}