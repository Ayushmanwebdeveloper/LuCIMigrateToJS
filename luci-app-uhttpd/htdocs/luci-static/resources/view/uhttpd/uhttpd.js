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
    
      ucs = m.section(form.Typedsection, 'uhttpd');
      ucs.addremove = true;
      ucs.anonymous = false;

      ucs.tab("general", _("General Settings"))
      ucs.tab("server", _("Full Web Server Settings"), _("For settings primarily geared to serving more than the web UI"))
      ucs.tab("advanced", _("Advanced Settings"), _("Settings which are either rarely needed or which affect serving the WebUI"))

      lhttp = ucs.taboption("general", form.DynamicList, "listen_http", _("HTTP listeners (address:port)"), _("Bind to specific interface:port (by specifying interface address"))
      lhttp.datatype = 'list(ipaddrport(1))'

      lhttp.validate=function(section_id, value) {
        var have_https_listener = false;
        var have_http_listener = false;
        if (lhttp && lhttp.formvalue(section_id) && (lhttp.formvalue(section_id).length > 0)) {
          lhttp.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_http_listener = true;
              return;
            }
          });
        }
        if (lhttps && lhttps.formvalue(section_id) && (lhttps.formvalue(section_id).length > 0)) {
          lhttps.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_https_listener = true;
              return;
            }
          });
        }
        if (!(have_http_listener || have_https_listener)) {
          return [null, "must listen on at least one address:port"];
        }
        return form.DynamicList.validate(section_id, value);
      }

      
      lhttps = ucs.taboption("general", form.DynamicList, "listen_https", _("HTTPS listener (address:port)"), _("Bind to specific interface:port (by specifying interface address"))
      lhttps.datatype = "list(ipaddrport(1))"
      lhttps.depends("cert")
      lhttps.depends("key")

      lhttps.validate=function(section_id, value) {
        let have_https_listener = false;
        let have_http_listener = false;
      
        if (lhttps && lhttps.formvalue(section_id) && (lhttps.formvalue(section_id).length > 0)) {
          for (let i = 0; i < lhttps.formvalue(section_id).length; i++) {
            let v = lhttps.formvalue(section_id)[i];
            if (v && (v !== "")) {
              have_https_listener = true;
              break;
            }
          }
          if (have_https_listener && ((!cert_file) || (!cert_file.formvalue(section_id)) || (cert_file.formvalue(section_id) === ""))) {
            return [null, "must have certificate when using https"];
          }
          if (have_https_listener && ((!key_file) || (!key_file.formvalue(section_id)) || (key_file.formvalue(section_id) === ""))) {
            return [null, "must have key when using https"];
          }
        }
      
        if (lhttp && lhttp.formvalue(section_id) && (lhttp.formvalue(section_id).length > 0)) {
          for (let i = 0; i < lhttp.formvalue(section_id).length; i++) {
            let v = lhttp.formvalue(section_id)[i];
            if (v && (v !== "")) {
              have_http_listener = true;
              break;
            }
          }
        }
      
        if (!(have_http_listener || have_https_listener)) {
          return [null, "must listen on at least one address:port"];
        }
      
        return DynamicList.validate(section_id, value);
      }



      
      return m.render();
    },
  });