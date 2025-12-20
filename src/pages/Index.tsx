import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MaterialCard } from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/SearchFilter";
import { MaterialDialog } from "@/components/MaterialDialog";
import { AdminLogin } from "@/components/AdminLogin";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AnnouncementDialog } from "@/components/AnnouncementDialog";
import { CreateAdminDialog } from "@/components/CreateAdminDialog";
import { DashboardStats } from "@/components/DashboardStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { VisitorCounter } from "@/components/VisitorCounter";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ScrollReveal, ParallaxSection } from "@/components/ParallaxSection";
import heroBackground from "@/assets/hero-background.jpg";
import geographyIcon from "@/assets/geography-icon.png";
import patternBackground from "@/assets/pattern-background.png";
import mountain1 from "@/assets/mountain-1.jpg";
import landscape1 from "@/assets/landscape-1.jpg";
import mountain2 from "@/assets/mountain-2.jpg";
import landscape2 from "@/assets/landscape-2.jpg";

interface Material {
  id: string;
  title: string;
  category: string;
  google_drive_link: string;
  upload_date: string;
  view_count: number;
}

const Index = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterAndSortMaterials();
  }, [materials, searchTerm, selectedCategory, sortOrder]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching materials',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setMaterials(data);
    }
  };

  const filterAndSortMaterials = () => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.upload_date).getTime();
      const dateB = new Date(b.upload_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredMaterials(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_material',
          materialId: id,
        }
      });

      if (error) throw error;

      toast({
        title: 'Material deleted successfully',
      });
      
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: 'Error deleting material',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background relative scroll-smooth">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-50" />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: `url(${patternBackground})`,
              backgroundSize: '300px 300px',
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
        
        {/* Fixed Navbar */}
        <header className="glass fixed top-0 w-full z-50 shadow-elevated">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 animate-fade-in">
                <div className="relative">
                  <img 
                    src={geographyIcon} 
                    alt="TASSA Learning Hub" 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-glow ring-2 ring-primary/30 hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute -inset-1 bg-gradient-primary rounded-xl opacity-20 blur-sm -z-10" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-lg md:text-xl font-display font-bold text-gradient">
                    TASSA LEARNING HUB
                  </h1>
                  <span className="hidden sm:block text-xs text-muted-foreground font-medium">Geography Excellence</span>
                </div>
              </div>
              
              {/* Navigation Links - Desktop only */}
              <nav className="hidden lg:flex items-center gap-1">
                {['Home', 'About', 'Materials', 'Gallery', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="px-4 py-2 text-sm font-medium hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/10 relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-primary group-hover:w-3/4 transition-all duration-300" />
                  </a>
                ))}
              </nav>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/faq" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">FAQ</Button>
                </Link>
                <Link to="/request-material">
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-accent hover:scale-105 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 font-semibold">
                    <span className="hidden sm:inline">Request</span>
                    <span className="sm:hidden">Req</span>
                  </Button>
                </Link>
                <ThemeToggle />
                <AdminLogin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex lg:hidden items-center justify-center gap-1 mt-2 pb-1 overflow-x-auto scrollbar-hide">
              {['Home', 'About', 'Materials', 'Gallery', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="px-3 py-1.5 text-xs font-medium hover:text-primary transition-all rounded-lg hover:bg-primary/10 whitespace-nowrap"
                >
                  {item}
                </a>
              ))}
              <Link to="/faq" className="sm:hidden px-3 py-1.5 text-xs font-medium hover:text-primary transition-all rounded-lg hover:bg-primary/10 whitespace-nowrap">
                FAQ
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section with Parallax */}
        <section id="home" className="relative overflow-hidden pt-24 sm:pt-20 min-h-[85vh] sm:min-h-[95vh] flex items-center">
          {/* Parallax Background */}
          <ParallaxSection speed={0.3} className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-30 scale-110"
              style={{
                backgroundImage: `url(${heroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }}
            />
          </ParallaxSection>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          
          <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text Content */}
              <ScrollReveal direction="left" className="text-center lg:text-left space-y-5 sm:space-y-7">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-2 sm:mb-4 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-primary">TASSA LEARNING HUB</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1]">
                  <span className="text-foreground">Explore</span>{' '}
                  <span className="text-gradient">Geography</span>
                  <br />
                  <span className="text-gradient-accent">Materials</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Access comprehensive educational resources, exam materials, and study guides for geography students and educators
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                  <a href="#materials" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-accent hover:scale-105 transition-all duration-300 font-semibold text-base px-8">
                      Browse Materials
                    </Button>
                  </a>
                  <a href="#about" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300 font-semibold">
                      Learn More
                    </Button>
                  </a>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-8 mt-8 pt-8 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-gradient">500+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Resources</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-gradient-accent">1000+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-gradient">50+</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Educators</p>
                  </div>
                </div>
              </ScrollReveal>
              
              {/* Image Carousel */}
              <ScrollReveal direction="right" delay={0.2} className="hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-20 blur-2xl" />
                  <ImageCarousel />
                </div>
              </ScrollReveal>
            </div>
            
            {/* Mobile Carousel */}
            <ScrollReveal direction="up" delay={0.3} className="md:hidden mt-10">
              <ImageCarousel />
            </ScrollReveal>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 sm:py-24 relative z-10 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal className="text-center mb-12 sm:mb-16">
                <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
                  Why Choose Us
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                  About <span className="text-gradient">TASSA</span> <span className="text-gradient-accent">LEARNING HUB</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your comprehensive source for geography education and research materials
                </p>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { icon: '📚', title: 'Educational Resources', desc: 'Access comprehensive study materials and learning resources for all levels', delay: 0.1 },
                  { icon: '📝', title: 'Exam Materials', desc: 'Browse past papers and examination resources to excel in your studies', delay: 0.2 },
                  { icon: '🗺️', title: 'Geography Content', desc: 'Explore maps, research papers, and comprehensive geographic data', delay: 0.3 },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={item.delay}>
                    <div className="card-earth p-6 sm:p-8 bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow group h-full">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-glow">
                        <span className="text-2xl sm:text-3xl">{item.icon}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Announcements */}
          <div className="mb-6">
            <AnnouncementBanner 
              isAdmin={isAdmin} 
              onRefresh={fetchMaterials}
            />
          </div>

          {/* Admin Dashboard */}
          {isAdmin && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <MaterialDialog onSuccess={fetchMaterials} />
                <AnnouncementDialog onSuccess={fetchMaterials} />
                <CreateAdminDialog />
              </div>
              <DashboardStats />
            </div>
          )}

          {/* Search and Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {/* Materials Section */}
          <section id="materials" className="mb-10 sm:mb-16">
            <ScrollReveal className="text-center mb-10 sm:mb-14">
              <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent mb-4">
                Resource Library
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                Available <span className="text-gradient">Materials</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse our comprehensive collection of geography resources
              </p>
            </ScrollReveal>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-8">
            {filteredMaterials.map((material, index) => (
              <ScrollReveal key={material.id} delay={index * 0.05}>
                <MaterialCard
                  material={material}
                  isAdmin={isAdmin}
                  onEdit={setEditingMaterial}
                  onDelete={handleDelete}
                />
              </ScrollReveal>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-muted-foreground">No materials found matching your criteria. Try adjusting your search terms.</p>
            </div>
          )}
        </div>
        
        {/* Gallery Section with Parallax */}
        <section id="gallery" className="py-16 sm:py-24 relative z-10 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-muted/30 to-background" />
          <ParallaxSection speed={0.2} className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-primary" />
          </ParallaxSection>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal className="text-center mb-10 sm:mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
                Visual Gallery
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                Geography in <span className="text-gradient">View</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore the beauty and diversity of our planet's landscapes
              </p>
            </ScrollReveal>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {[
                { img: mountain1, alt: 'Snow-capped mountain peaks', title: 'Mountain Peaks', delay: 0.1 },
                { img: landscape1, alt: 'Green valley landscape', title: 'Valley Landscape', delay: 0.2 },
                { img: mountain2, alt: 'Mountain range at sunset', title: 'Sunset Range', delay: 0.3 },
                { img: landscape2, alt: 'Hills and natural terrain', title: 'Natural Terrain', delay: 0.4 },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={item.delay}>
                  <div className="group overflow-hidden rounded-2xl shadow-elevated hover:shadow-glow transition-all duration-500 relative">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img 
                        src={item.img} 
                        alt={item.alt} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4">
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-primary-foreground">{item.title}</p>
                          <p className="text-xs text-primary-foreground/70">Geography Collection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 sm:py-24 relative z-10">
          <div className="absolute inset-0 hero-pattern opacity-30" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-10 sm:mb-14">
                <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent mb-4">
                  Contact Us
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
                  Get in <span className="text-gradient-accent">Touch</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Need specific geography materials? We're here to help
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-primary rounded-3xl opacity-20 blur-xl" />
                  <div className="relative glass rounded-2xl sm:rounded-3xl border border-primary/20 p-6 sm:p-10 md:p-14">
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
                        <span className="text-3xl sm:text-4xl">💬</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-display font-bold">Contact Us on WhatsApp</h3>
                      <p className="text-muted-foreground max-w-xl mx-auto">
                        Have questions or need assistance finding specific materials? Reach out to us directly and we'll help you find what you need.
                      </p>
                      <a 
                        href="https://wa.me/255756377013" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-accent hover:scale-105 transition-all duration-300 font-semibold text-base px-8">
                          <span className="mr-2">📱</span>
                          +255 756 377 013
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 sm:py-16 border-t border-border/50 bg-muted/20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={geographyIcon} 
                    alt="TASSA LEARNING HUB" 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-glow"
                  />
                  <div className="absolute -inset-2 bg-gradient-primary rounded-2xl opacity-20 blur-lg -z-10" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-gradient">
                TASSA LEARNING HUB
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Your comprehensive source for geography education and research materials for students and educators.
              </p>
              
              {/* Visitor Counter in Footer */}
              <div className="flex justify-center py-4">
                <VisitorCounter />
              </div>
              
              <div className="pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground/60">
                  © 2025 TASSA LEARNING HUB. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <div className="container mx-auto px-4 relative z-10">
          {/* AdSense - After content */}
          <AdSenseUnit />
        </div>

        {/* Edit Material Dialog */}
        {editingMaterial && (
          <MaterialDialog
            material={editingMaterial}
            onSuccess={() => {
              fetchMaterials();
              setEditingMaterial(undefined);
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default Index;
