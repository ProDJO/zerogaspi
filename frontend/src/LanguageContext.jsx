import { createContext, useContext, useEffect, useState } from "react";

// ── Dictionnaire de traductions ──
const translations = {
  fr: {
    // Nav
    nav_home:         "🏠 Accueil",
    nav_login:        "🔐 Connexion",
    nav_register:     "📝 S'inscrire",
    nav_reservations: "📋 Mes Réservations",
    nav_vendeur:      "🏪 Espace Vendeur",
    nav_livreur:      "🚚 Espace Livreur",
    nav_admin:        "🛠️ Admin",
    // Dropdown
    dd_profile:       "👤 Mon Profil",
    dd_settings:      "⚙️ Paramètres",
    dd_logout:        "🚪 Déconnexion",
    // Paramètres
    settings_title:        "⚙️ Paramètres",
    settings_subtitle:     "Personnalisez votre expérience sur Zerogaspi.",
    settings_appearance:   "🎨 Apparence",
    settings_darkmode:     "Mode sombre",
    settings_darkmode_desc:"Passe l'interface en thème sombre pour réduire la fatigue visuelle.",
    settings_notif:        "🔔 Notifications",
    settings_notif_email:  "Notifications par email",
    settings_notif_email_desc: "Recevez des alertes par email pour vos réservations et livraisons.",
    settings_notif_push:   "Notifications push",
    settings_notif_push_desc: "Activez les notifications dans le navigateur.",
    settings_langue:       "🌐 Langue & région",
    settings_langue_label: "Langue de l'interface",
    settings_langue_desc:  "Choisissez la langue d'affichage de l'application.",
    settings_privacy:      "🔒 Confidentialité",
    settings_privacy_data: "Données de navigation",
    settings_privacy_desc: "Autorisez l'application à mémoriser vos préférences de navigation.",
    settings_danger:       "⚠️ Zone de danger",
    settings_danger_desc:  "La suppression de votre compte est irréversible. Toutes vos données seront effacées.",
    settings_delete_btn:   "Supprimer mon compte",
    // Profil
    profil_title:          "👤 Mon Profil",
    profil_id:             "ID",
    profil_role:           "Rôle actuel",
    profil_change_photo:   "Changer la photo",
    profil_uploading:      "Upload...",
    profil_role_request:   "Demander un changement de rôle",
    profil_role_desc:      "Devenez vendeur pour publier des produits, ou livreur pour effectuer des livraisons. Votre demande sera examinée par un administrateur.",
    profil_role_label:     "Rôle souhaité :",
    profil_role_send:      "Envoyer la demande",
    profil_role_sending:   "Envoi...",
    profil_role_other:     "Votre rôle vous donne accès à votre espace dédié dans la navigation.",
    // HomePage
    home_title:       "🏠 Produits disponibles",
    home_loading:     "Chargement...",
    home_empty:       "Aucun produit disponible pour le moment.",
    home_price:       "Prix",
    home_stock:       "Stock",
    home_reserve:     "Réserver",
    home_login_to_reserve: "🔐 Connectez-vous pour réserver",
    home_out_of_stock:"Rupture de stock",
    // Commun
    save:    "Enregistrer",
    cancel:  "Annuler",
    edit:    "Modifier",
    delete:  "Supprimer",
    create:  "Créer",
    loading: "Chargement...",
    send:    "Envoyer",
  },

  en: {
    nav_home:         "🏠 Home",
    nav_login:        "🔐 Login",
    nav_register:     "📝 Sign Up",
    nav_reservations: "📋 My Reservations",
    nav_vendeur:      "🏪 Seller Space",
    nav_livreur:      "🚚 Delivery Space",
    nav_admin:        "🛠️ Admin",
    dd_profile:       "👤 My Profile",
    dd_settings:      "⚙️ Settings",
    dd_logout:        "🚪 Logout",
    settings_title:        "⚙️ Settings",
    settings_subtitle:     "Customize your Zerogaspi experience.",
    settings_appearance:   "🎨 Appearance",
    settings_darkmode:     "Dark mode",
    settings_darkmode_desc:"Switch to dark theme to reduce eye strain.",
    settings_notif:        "🔔 Notifications",
    settings_notif_email:  "Email notifications",
    settings_notif_email_desc: "Receive alerts by email for your reservations and deliveries.",
    settings_notif_push:   "Push notifications",
    settings_notif_push_desc: "Enable browser notifications.",
    settings_langue:       "🌐 Language & region",
    settings_langue_label: "Interface language",
    settings_langue_desc:  "Choose the display language of the application.",
    settings_privacy:      "🔒 Privacy",
    settings_privacy_data: "Browsing data",
    settings_privacy_desc: "Allow the application to remember your browsing preferences.",
    settings_danger:       "⚠️ Danger zone",
    settings_danger_desc:  "Account deletion is irreversible. All your data will be erased.",
    settings_delete_btn:   "Delete my account",
    profil_title:          "👤 My Profile",
    profil_id:             "ID",
    profil_role:           "Current role",
    profil_change_photo:   "Change photo",
    profil_uploading:      "Uploading...",
    profil_role_request:   "Request a role change",
    profil_role_desc:      "Become a seller to publish products, or a delivery driver to make deliveries. Your request will be reviewed by an administrator.",
    profil_role_label:     "Desired role:",
    profil_role_send:      "Send request",
    profil_role_sending:   "Sending...",
    profil_role_other:     "Your role gives you access to your dedicated space in the navigation.",
    home_title:       "🏠 Available Products",
    home_loading:     "Loading...",
    home_empty:       "No products available at the moment.",
    home_price:       "Price",
    home_stock:       "Stock",
    home_reserve:     "Reserve",
    home_login_to_reserve: "🔐 Login to reserve",
    home_out_of_stock:"Out of stock",
    save:    "Save",
    cancel:  "Cancel",
    edit:    "Edit",
    delete:  "Delete",
    create:  "Create",
    loading: "Loading...",
    send:    "Send",
  },

  ar: {
    nav_home:         "🏠 الرئيسية",
    nav_login:        "🔐 تسجيل الدخول",
    nav_register:     "📝 إنشاء حساب",
    nav_reservations: "📋 حجوزاتي",
    nav_vendeur:      "🏪 فضاء البائع",
    nav_livreur:      "🚚 فضاء التوصيل",
    nav_admin:        "🛠️ الإدارة",
    dd_profile:       "👤 ملفي الشخصي",
    dd_settings:      "⚙️ الإعدادات",
    dd_logout:        "🚪 تسجيل الخروج",
    settings_title:        "⚙️ الإعدادات",
    settings_subtitle:     "خصّص تجربتك على Zerogaspi.",
    settings_appearance:   "🎨 المظهر",
    settings_darkmode:     "الوضع الداكن",
    settings_darkmode_desc:"تحويل الواجهة إلى المظهر الداكن لتقليل إجهاد العين.",
    settings_notif:        "🔔 الإشعارات",
    settings_notif_email:  "إشعارات البريد الإلكتروني",
    settings_notif_email_desc: "تلقّ تنبيهات بالبريد حول حجوزاتك وتوصيلاتك.",
    settings_notif_push:   "إشعارات المتصفح",
    settings_notif_push_desc: "تفعيل الإشعارات في المتصفح.",
    settings_langue:       "🌐 اللغة والمنطقة",
    settings_langue_label: "لغة الواجهة",
    settings_langue_desc:  "اختر لغة عرض التطبيق.",
    settings_privacy:      "🔒 الخصوصية",
    settings_privacy_data: "بيانات التصفح",
    settings_privacy_desc: "السماح للتطبيق بحفظ تفضيلات التصفح.",
    settings_danger:       "⚠️ منطقة الخطر",
    settings_danger_desc:  "حذف الحساب لا رجعة فيه. سيتم مسح جميع بياناتك.",
    settings_delete_btn:   "حذف حسابي",
    profil_title:          "👤 ملفي الشخصي",
    profil_id:             "المعرّف",
    profil_role:           "الدور الحالي",
    profil_change_photo:   "تغيير الصورة",
    profil_uploading:      "جارٍ الرفع...",
    profil_role_request:   "طلب تغيير الدور",
    profil_role_desc:      "كن بائعاً لنشر المنتجات، أو سائق توصيل للقيام بالتوصيلات. سيتم مراجعة طلبك من قبل مسؤول.",
    profil_role_label:     "الدور المطلوب:",
    profil_role_send:      "إرسال الطلب",
    profil_role_sending:   "جارٍ الإرسال...",
    profil_role_other:     "دورك يمنحك الوصول إلى فضائك المخصص في شريط التنقل.",
    home_title:       "🏠 المنتجات المتاحة",
    home_loading:     "جارٍ التحميل...",
    home_empty:       "لا توجد منتجات متاحة حالياً.",
    home_price:       "السعر",
    home_stock:       "المخزون",
    home_reserve:     "احجز",
    home_login_to_reserve: "🔐 سجّل دخولك للحجز",
    home_out_of_stock:"نفذ المخزون",
    save:    "حفظ",
    cancel:  "إلغاء",
    edit:    "تعديل",
    delete:  "حذف",
    create:  "إنشاء",
    loading: "جارٍ التحميل...",
    send:    "إرسال",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [langue, setLangue] = useState(() => {
    return localStorage.getItem("langue") || "fr";
  });

  // Applique la direction RTL pour l'arabe
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", langue);
    html.setAttribute("dir", langue === "ar" ? "rtl" : "ltr");
    localStorage.setItem("langue", langue);
  }, [langue]);

  // Fonction de traduction : t("clé") → texte traduit
  const t = (key) => translations[langue]?.[key] ?? translations.fr[key] ?? key;

  return (
    <LanguageContext.Provider value={{ langue, setLangue, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans un <LanguageProvider>");
  return ctx;
}
