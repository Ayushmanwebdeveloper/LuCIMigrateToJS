'use strict';
'require view';
'require form';
'require fs';

var lhttp = null
var lhttps = null
var cert_file = null
var key_file = null


return view.extend({
    render: function() {

      var m, s, o;
      m = new form.Map('uhttpd', _('uHTTPd'),
      _('A lightweight single-threaded HTTP(S) server'));
    
      ucs = m.section(form.TypedSection, 'uhttpd');
      ucs.addremove = true;
      ucs.anonymous = false;

      
      return m.render();
    },
  });