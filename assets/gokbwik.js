
  (function(){
    $('body').on('keyup', '.noEnterSubmit', function(e){
        $(this).parents('form').find('input[type="submit"]').prop("disabled", true);
        //if ( e.which == 13 ) return false;
        if ( e.which == 13 ) e.preventDefault();
    });
    
  account.selectors = {
    order_menu: document.querySelectorAll('.account__view_trigger'),
    view: document.querySelector('#account-view'),
    order_menu_items: document.querySelectorAll('.account__menu_item'),
  }
 
    $(function() {      
    let isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;

    if (isMobile) {
        $(".account__view_trigger").click(function() {
    $('html, body').animate({
        scrollTop: $("#account-view").offset().top - 200
    }, 200);
});
    }
 });
    
  account.utils = {}
  account.utils.get_param = function(str) {
    var queryString = str || window.location.search || ''
    var keyValPairs = []
    var params = {}
    queryString = queryString.replace(/.*?\?/, '')
  
    if (queryString.length) {
      keyValPairs = queryString.split('&')
      for (let pairNum in keyValPairs) {
        var key = keyValPairs[pairNum].split('=')[0]
        if (!key.length) continue
        if (typeof params[key] === 'undefined') { params[key] = [] }
        params[key].push(keyValPairs[pairNum].split('=')[1])
      }
    }
    return params
  }

  account.cancel_order = function() {
    var self = this
    $("body").on("click", ".cancel-order-btn", function(){
      var order_id = $(this).attr("data-order_id");
      var url = "https://backend.shakehands.co.in/oms/order-update/"+order_id;
      var postData = JSON.stringify({"status": "cancelled", "fieldType": "order_id", "comment": "This is a customer initiated cancellation"});
      /*$.post(url, postData, {headers:{"Content-Type":"application/json",accept:"application/json"}}).done(function( data ) {
          alert("Your Order has been cancelled.");
          //window.location.reload();
      });*/
      var r = confirm("Do you want to cancel your order?");
      if(r){
        $.ajax({
          type: 'POST',
          url: url,
          data: postData,
          dataType: 'json',
          processData: false,
          contentType: "application/json",
          success: function (data) {
            if(data.success){
              alert("Your Order has been cancelled.");
              window.location.reload();
            }
          }
        });
      }
    });
  }
  account.discounts_available = function() {
    var self = this
    if($(".coupon__items.discounts_available").length > 0){
      var url = "https://backend.shakehands.co.in/discounts/available";
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function (data) {
          if(data.data.length > 0){
            var html = '';
            $.each(data.data, function(index, value){
              var codeDiscount = value.codeDiscount;
              var title = codeDiscount.title;
              var shortSummary = codeDiscount.shortSummary;
              var endsAt = codeDiscount.endsAt;
              
              html += '<div class="ticket1">\
                <div class="ticket1__shape">\
                    <div class="top"></div>\
                    <div class="rip"></div>\
                    <div class="bottom"></div>\
                </div>\
                <div class="ticket1__content">\
                    <div class="coupon__item_title" style="display: flex;justify-content: space-between;">\
                      <h5 class="discount__code">'+title+'</h5>\
                      <span class="copy__to_clip" style="color: #FF5555; text-decoration: underline;cursor: pointer;font-size: 14px;">Copy</span>\
                    </div>\
                    <div class="coupon__item_content">\
                      <!-- <span style="color:#f33fb7">10% off</span>-->\
                      <span>'+shortSummary+'</span>\
                    </div>\
                      <div class="coupon__item_bottom">\
                        <div class="coupon__item_bottom-date">Valid until '+(endsAt ? endsAt : '')+'</div>\
                      <div class="coupon__item_bottom-more"></div>\
                      </div>\
                  </div>\
              </div>';
            });
            $(".coupon__items.discounts_available").html(html);
            self.copy_text()
          }
        }
      });
    }
  }
  account.copy_text = function() {
    var self = this
    var view = self.selectors.view
    var trigger = view.querySelectorAll('.copy__to_clip')
    var note = view.querySelector('#snackbar')
    if (trigger.length === 0) return null
    trigger.forEach(function(t){
      t.addEventListener('click', function(e){
        var target = e.target
        var parent = target.closest('.coupon__item_title')
        var codeNode = parent.querySelector('.discount__code')
        var code = codeNode.innerText
        navigator.clipboard.writeText(code)
        note.classList.add('show')
        setTimeout(function(){
          note.classList.remove('show')
          window.location = "/cart";
        }, 1500)
      })
    })
  }
  account.slider = function(selector, options) {
    var swiper = new Swiper(selector, {
        ...options
      });
  }
  account.fetch_section = async function(url, section_id, section_selector) {
    var res = await fetch(url)
    var raw = await res.text()
    var parser = new DOMParser()
    var html = parser.parseFromString(raw, "text/html")
    var section = html.querySelector(`#${section_selector}`)
    return section
  }
  account.append_section = function(section, node, className) {
    node.classList.add(className)
    node.innerHTML = section.innerHTML
  }
  account.delete_address = function(remove) {
    var r = confirm("Are you sure you want to delete it?");
    if(r){
      var id = remove.dataset.addressId
      Shopify.postLink('/account/addresses/'+id, {'parameters': {'_method': 'delete'}}); 
    }
  }
  account.handle_address = function() {
    var self = this
    var view = self.selectors.view
    var edit = view.querySelectorAll('#edit-address')
    var address_items = view.querySelector('.addresses__items')
    var address_header = view.querySelector('.address__section_header')
    var remove = view.querySelectorAll('.addresses__item_actions [data-address-id]')
    remove.forEach(function(remove){
      remove.addEventListener('click', function(e){
        self.delete_address(remove)
      })
    })
    edit.forEach(function(edit){
    edit.addEventListener('click', function(e){
      var target = e.target
      var address_id = target.dataset.action
      var address_forms = view.querySelectorAll('.edit__address_item')
      address_forms.forEach(function(form){
        form.classList.add('new__form_hide')
      })
      var addess_form = view.querySelector(`.edit__address_item[data-id="${address_id}"]`)
      addess_form.classList.remove('new__form_hide')
      address_items.classList.add('new__form_hide')
      address_header.classList.add('new__form_hide')
      $('html, body').animate({
        scrollTop: $("#account-view").offset().top - 500
    }, 200);
    })
    })

    // ZIP CODE API
    // $("body").on("change", "input[name='address[zip]']", function(){
    //   var zip = $(this).val();
    //   var url = "https://backend.shakehands.co.in/api/zipcodes?where[zip][equals]="+zip;
    //   $.ajax({
    //     type: 'GET',
    //     url: url,
    //     dataType: 'json',
    //     processData: false,
    //     contentType: "application/json",
    //     success: function (data) {
    //       if(data.length){
    //         $('input[name="address[city]"]').val(data[0].city);
    //         $('input[name="address[province]"]').val(data[0].state);
    //         $('form').find('input[type="submit"]').prop("disabled", false);
    //       }else{
    //         $('input[name="address[zip]"]').val('');
    //         alert("Zip Code not Found!!"); return false;
    //       }
    //     }
    //   });
    // });
    
  $("body").on("change", "input[name='address[zip]']", function(){
  var zip = $(this).val();
  var url = "https://backend.shakehands.co.in/api/zipcodes?where[zip][equals]="+zip;
  
  // First try the API
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    processData: false,
    contentType: "application/json",
    success: function (data) {
      if(data.length){
        $('input[name="address[city]"]').val(data[0].city);
        $('input[name="address[province]"]').val(data[0].state);
        $('form').find('input[type="submit"]').prop("disabled", false);
      } else {
        checkLocalData(zip);
      }
    },
    error: function() {
      checkLocalData(zip);
    }
  });
});

function checkLocalData(zip) {
  if (typeof zipCodeData !== 'undefined' && zipCodeData[zip]) {
    $('input[name="address[city]"]').val(zipCodeData[zip].city);
    $('input[name="address[province]"]').val(zipCodeData[zip].state);
    $('form').find('input[type="submit"]').prop("disabled", false);
  } else {
    $('input[name="address[zip]"]').val('');
    alert("Zip Code not Found!!"); 
  }
}
  }
  account.add_new_address = function() {
    var self = this
    var parent = self.selectors.view
    var add_new = parent.querySelector('#add-new-address-trigger')
    if (add_new === null) return null
    var new_address_form = parent.querySelector('#add-new-address')
    var address_items = parent.querySelector('.addresses__items')
    var address_header = parent.querySelector('.address__section_header')
    add_new.addEventListener('click', function(e){
      e.preventDefault()
      new_address_form.classList.remove('new__form_hide')
      address_items.classList.add('new__form_hide')
      address_header.classList.add('new__form_hide')
    })
  }
  account.handle_reorder = function() {
    var self = this
    var ids = []
    var parent = self.selectors.view
    var trigger = parent.querySelector('#re-order-trigger')
    var checboxes = parent.querySelectorAll('.reorder__item_checkbox-wrapper [type="checkbox"]')
    if (trigger !== null) {
    trigger.addEventListener('click', async function(e){
      e.preventDefault()
      var data = []
      checboxes.forEach(function(checkbox){
        if (checkbox.checked) {
          data.push({
            id: parseInt(checkbox.value, 10),
            quantity: 1
          })
        }
      })
      if (data.length === 0 ) {
        var node = parent.querySelector('.section__header_error')
        node.innerHTML = '<strong>Error: </strong>Please Select Items to Proceed with re-order'
        return null
      }
      var items = {
        items: [...data]
      }
      var res = await fetch(`${Shopify.routes.root}cart/add.js`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(items)
      })
      var data = await res.json()
      if (res.ok) {
        // location.assign(`${Shopify.routes.root}cart`)
        cartModalScript.openCart();
      } else {
       var error = `<strong>Error: </strong>${data.description}`
        var node = parent.querySelector('.section__header_error')
        node.innerHTML = error
      }
    })
    }
    var triggers = parent.querySelectorAll('.re-order-trigger')
    if (triggers.length === 0) return null
    triggers.forEach(function(trigger){
      trigger.addEventListener('click', async function(e){
      e.preventDefault()
      var target = e.target.closest('.order__item_meta')
        var checboxes = target.querySelectorAll('.reorder__item_checkbox-wrapper [type="checkbox"]')
      var data = []
      checboxes.forEach(function(checkbox){
        if (checkbox.checked) {
          data.push({
            id: parseInt(checkbox.value, 10),
            quantity: 1
          })
        }
      })
      if (data.length === 0 ) {
        var node = parent.querySelector('.section__header_error')
        node.innerHTML = '<strong>Error: </strong>Please Select Items to Proceed with re-order'
        return null
      }
      var items = {
        items: [...data]
      }
      var res = await fetch(`${Shopify.routes.root}cart/add.js`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(items)
      })
      var data = await res.json()
      if (res.ok) {
        // location.assign(`${Shopify.routes.root}cart`)
        cartModalScript.openCart();
      } else {
       var error = `<strong>Error: </strong>${data.description}`
        var node = parent.querySelector('.section__header_error')
        node.innerHTML = error
      }
    })
    })
  }
  account.handle_click = function() {
    var self = this
    self.selectors.order_menu.forEach(function(menu){
      menu.addEventListener('click', async function(e){
        e.preventDefault()
        e.stopPropagation()
        var target = e.target
        var section_id = target.closest('a').dataset.sectionId
        var selector = target.closest('a').dataset.selector
        var url = `${Shopify.routes.root}account?section_id=${section_id}`
        // Add Loading Screen
        self.selectors.order_menu_items.forEach(function(item){ item.classList.remove('_active')})
        var section = await self.fetch_section(url, section_id, selector)
        var node = self.selectors.view
        self.append_section(section, node, 'profile__info_item-view')
        target.closest('li').classList.add('_active')
        window.history.replaceState({ }, '', `${location.origin}/account?section=${section_id}`);
        var config = {
        slidesPerView: 3,
        spaceBetween: 20,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
          }
        }
        self.slider('.order__line_images', config)
        self.handle_address()
        self.add_new_address()
        self.handle_reorder()
        self.copy_text()
        self.discounts_available()
        self.cancel_order()
      })
    })
  }
  account.handle_section_onreload = async function() {
    var self = this
    var params = self.utils.get_param(window.location.href);
    var section_id = params.section[0]
    if (typeof section_id === 'undefined') return null
    var url = `${Shopify.routes.root}account?section_id=${section_id}`
    // Add Loading Screen
    self.selectors.order_menu_items.forEach(function(item){ item.classList.remove('_active')})
    var section = await self.fetch_section(url, section_id, section_id)
    var node = self.selectors.view
    self.append_section(section, node, 'profile__info_item-view')
    self.selectors.order_menu_items.forEach(function(item){
      var link = item.querySelector('a')
      if (link.getAttribute('data-section-id') === section_id) {
        item.classList.add('_active')
      }
    })
    var config = {
     slidesPerView: 3,
     spaceBetween: 20,
     navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
      }
     }
     self.slider('.order__line_images', config)
     self.handle_address()
     self.add_new_address()
     self.handle_reorder()
    self.copy_text()
    self.discounts_available()
    self.cancel_order()
  }
    // Calling all Account functions
    account.handle_reorder()
    account.handle_click()
    account.handle_section_onreload()
  })()
