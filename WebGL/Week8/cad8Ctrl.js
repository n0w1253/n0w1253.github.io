"use strict";

var mySliderRx, mySliderRy, mySliderRz;

function doOnLoad(){

    
    mySliderRx = new dhtmlXSlider({
        parent: "sliderObjRx",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRx",
    });
    mySliderRy = new dhtmlXSlider({
        parent: "sliderObjRy",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRy",
    });
    mySliderRz = new dhtmlXSlider({
        parent: "sliderObjRz",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRz",
    });
    
  
    
    mySliderRx.attachEvent("onChange", function(pos, slider){
        window.inpRx = mySliderRx.getValue();
    });
    mySliderRy.attachEvent("onChange", function(pos, slider){
        window.inpRy = mySliderRy.getValue();
    });
    mySliderRz.attachEvent("onChange", function(pos, slider){
        window.inpRz = mySliderRz.getValue();
    });
     
};



$(".field").on('input', function(){
    setCadValues();
});

$(".option").change(function(){
    window.inpShape = $(this).children("option:selected").index();
    
});

jQuery('.tabs .tab-links a').on('click', function(e){
    var currentAttrValue = jQuery(this).attr('href');
    
    // Show/Hide Tabs
    jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
    
    // Change/remove current tab to active
    jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
    
    e.preventDefault();
});


function resetRotation(){
    mySliderRx.setValue(0);
    mySliderRy.setValue(0);
    mySliderRz.setValue(0);
    setCadValues();
}


function setCadValues(){
   
    window.inpRx = $("#inpRx").val();
    window.inpRy = $("#inpRy").val();
    window.inpRz = $("#inpRz").val();

}

