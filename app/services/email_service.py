import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

# ── Configura estas variables en tu .env o directamente aquí ──
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", 587))
SMTP_USER     = os.getenv("SMTP_USER", "tucorreo@gmail.com")       # <- tu correo Gmail
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "tu_app_password")      # <- contraseña de app Gmail
ADMIN_EMAIL   = os.getenv("ADMIN_EMAIL", "admin@tusistema.com")    # <- correo del admin

BRAND_COLOR   = "#f7971e"
DARK_BG       = "#0f2027"
YEAR          = datetime.now().year


def _build_html(titulo: str, cuerpo_html: str, tipo: str = "info") -> str:
    colores = {
        "info":    ("#f7971e", "ℹ️"),
        "danger":  ("#e63946", "⚠️"),
        "success": ("#51cf66", "✅"),
        "warning": ("#ffd200", "🔔"),
    }
    color, icono = colores.get(tipo, colores["info"])

    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- ENCABEZADO -->
        <tr>
          <td style="background:{DARK_BG};border-radius:12px 12px 0 0;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:700;color:{BRAND_COLOR};letter-spacing:1px;">
                    🏟️ SISTEMA DEPORTIVO
                  </span><br/>
                  <span style="font-size:12px;color:#aaa;">Panel de Administración</span>
                </td>
                <td align="right">
                  <span style="font-size:28px;">{icono}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FRANJA COLOR -->
        <tr>
          <td style="background:{color};height:4px;"></td>
        </tr>

        <!-- CUERPO -->
        <tr>
          <td style="background:#ffffff;padding:32px 36px;border-radius:0;">
            <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">{titulo}</h2>
            {cuerpo_html}
          </td>
        </tr>

        <!-- PIE -->
        <tr>
          <td style="background:{DARK_BG};border-radius:0 0 12px 12px;padding:20px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#666;font-size:11px;">
                  Este correo fue generado automáticamente por el Sistema Deportivo.<br/>
                  Por favor no responda este mensaje.
                </td>
                <td align="right" style="color:#444;font-size:11px;">
                  © {YEAR} Sistema Deportivo
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def _send(to_emails: list[str], subject: str, html: str):
    """Envía el correo a una lista de destinatarios."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Sistema Deportivo] {subject}"
        msg["From"]    = f"Sistema Deportivo <{SMTP_USER}>"
        msg["To"]      = ", ".join(to_emails)
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_emails, msg.as_string())
        print(f"[EMAIL] Enviado a {to_emails} — {subject}")
    except Exception as e:
        # No interrumpir el flujo principal si el correo falla
        print(f"[EMAIL ERROR] {e}")


# ══════════════════════════════════════════════
#  PLANTILLAS DE CORREO
# ══════════════════════════════════════════════

def notify_user_deleted(admin_email: str, user_nombre: str, user_email: str):
    """Notifica al admin y al usuario afectado cuando se elimina una cuenta."""
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")

    # Correo al usuario eliminado
    cuerpo_usuario = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Hola <strong>{user_nombre}</strong>,<br/><br/>
      Te informamos que tu cuenta en el <strong>Sistema Deportivo</strong> ha sido
      <span style="color:#e63946;font-weight:600;">eliminada</span> por un administrador
      el <strong>{fecha}</strong>.<br/><br/>
      Si crees que esto es un error, comunícate con el equipo de soporte.
    </p>
    <div style="background:#fff5f5;border-left:4px solid #e63946;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#c0392b;font-size:13px;">
        ⚠️ Esta acción es permanente. Tu información ha sido removida del sistema.
      </p>
    </div>
    """
    html_usuario = _build_html("Tu cuenta ha sido eliminada", cuerpo_usuario, "danger")
    _send([user_email], "Tu cuenta ha sido eliminada", html_usuario)

    # Correo al admin
    cuerpo_admin = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Se ha realizado la siguiente acción en el sistema:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Acción:</td>
          <td style="padding:6px 0;font-weight:600;color:#e63946;">Eliminación de usuario</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Usuario:</td>
          <td style="padding:6px 0;font-weight:600;">{user_nombre}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Correo:</td>
          <td style="padding:6px 0;">{user_email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Fecha:</td>
          <td style="padding:6px 0;">{fecha}</td></tr>
    </table>
    """
    html_admin = _build_html("Usuario eliminado del sistema", cuerpo_admin, "danger")
    _send([admin_email], "Usuario eliminado del sistema", html_admin)


def notify_role_updated(admin_email: str, user_nombre: str, user_email: str,
                         rol_anterior: str, rol_nuevo: str):
    """Notifica cambio de rol al usuario y al admin."""
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")

    cuerpo_usuario = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Hola <strong>{user_nombre}</strong>,<br/><br/>
      Tu rol en el <strong>Sistema Deportivo</strong> ha sido actualizado.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Rol anterior:</td>
          <td style="padding:6px 0;color:#e63946;font-weight:600;">{rol_anterior}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Nuevo rol:</td>
          <td style="padding:6px 0;color:#51cf66;font-weight:600;">{rol_nuevo}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Fecha:</td>
          <td style="padding:6px 0;">{fecha}</td></tr>
    </table>
    <p style="color:#888;font-size:13px;">
      Si no esperabas este cambio, comunícate con el administrador del sistema.
    </p>
    """
    html_usuario = _build_html("Tu rol ha sido actualizado", cuerpo_usuario, "warning")
    _send([user_email], "Tu rol ha sido actualizado", html_usuario)

    cuerpo_admin = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Se realizó un cambio de rol en el sistema:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Usuario:</td>
          <td style="padding:6px 0;font-weight:600;">{user_nombre}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Correo:</td>
          <td style="padding:6px 0;">{user_email}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Rol anterior:</td>
          <td style="padding:6px 0;color:#e63946;font-weight:600;">{rol_anterior}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Nuevo rol:</td>
          <td style="padding:6px 0;color:#51cf66;font-weight:600;">{rol_nuevo}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Fecha:</td>
          <td style="padding:6px 0;">{fecha}</td></tr>
    </table>
    """
    html_admin = _build_html("Cambio de rol realizado", cuerpo_admin, "warning")
    _send([admin_email], "Cambio de rol realizado", html_admin)


def notify_report_generated(admin_email: str, admin_nombre: str,
                              filtros: dict, total_registros: int):
    """Notifica al admin cuando se genera un reporte."""
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    filtros_html = "".join([
        f"<tr><td style='padding:5px 0;color:#888;font-size:13px;width:140px;'>{k}:</td>"
        f"<td style='padding:5px 0;font-weight:600;'>{v}</td></tr>"
        for k, v in filtros.items() if v
    ]) or "<tr><td colspan='2' style='color:#aaa;font-size:13px;'>Sin filtros aplicados</td></tr>"

    cuerpo = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Hola <strong>{admin_nombre}</strong>,<br/><br/>
      Se ha generado un nuevo reporte en el sistema con los siguientes parámetros:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
      <tr><td style="padding:5px 0;color:#888;font-size:13px;width:140px;">Fecha:</td>
          <td style="padding:5px 0;font-weight:600;">{fecha}</td></tr>
      <tr><td style="padding:5px 0;color:#888;font-size:13px;">Admin:</td>
          <td style="padding:5px 0;font-weight:600;">{admin_nombre}</td></tr>
      <tr><td colspan="2" style="padding:10px 0 4px;color:#555;font-size:13px;font-weight:600;">
        Filtros aplicados:
      </td></tr>
      {filtros_html}
    </table>
    <div style="background:#f0fff4;border-left:4px solid #51cf66;padding:14px 18px;
                border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#2d7d46;font-size:14px;font-weight:600;">
        ✅ Total de registros en el reporte: {total_registros}
      </p>
    </div>
    """
    html = _build_html("Reporte generado exitosamente", cuerpo, "success")
    _send([admin_email], "Reporte generado", html)


def notify_schedule_deleted(admin_email: str, sport: str, day: str,
                             time: str, location: str):
    """Notifica al admin cuando se elimina un horario."""
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    cuerpo = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Se ha eliminado el siguiente horario del sistema:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8f9fa;border-radius:8px;padding:20px;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Deporte:</td>
          <td style="padding:6px 0;font-weight:600;">{sport}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Día:</td>
          <td style="padding:6px 0;font-weight:600;">{day}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Hora:</td>
          <td style="padding:6px 0;font-weight:600;">{time}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Ubicación:</td>
          <td style="padding:6px 0;font-weight:600;">{location}</td></tr>
      <tr><td style="padding:6px 0;color:#888;font-size:13px;">Eliminado:</td>
          <td style="padding:6px 0;">{fecha}</td></tr>
    </table>
    """
    html = _build_html("Horario eliminado del sistema", cuerpo, "danger")
    _send([admin_email], "Horario eliminado", html)


def notify_sport_deleted(admin_email: str, sport_name: str):
    """Notifica al admin cuando se elimina un deporte."""
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    cuerpo = f"""
    <p style="color:#555;font-size:15px;line-height:1.7;">
      El deporte <strong style="color:#e63946;">{sport_name}</strong> ha sido eliminado
      del sistema el <strong>{fecha}</strong>.
    </p>
    <div style="background:#fff5f5;border-left:4px solid #e63946;padding:14px 18px;
                border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;color:#c0392b;font-size:13px;">
        ⚠️ Los horarios asociados a este deporte pueden haber sido afectados.
        Verifica la integridad de los datos.
      </p>
    </div>
    """
    html = _build_html("Deporte eliminado del sistema", cuerpo, "danger")
    _send([admin_email], f"Deporte eliminado: {sport_name}", html)